import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateStockStatus, evaluateStockFreshness } from '../shared';
import { broadcastStockUpdate } from '../services/socket.service';

export async function getPharmacyInventory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const pharmacy = await prisma.pharmacy.findFirst({ where: { ownerId: req.user.id } });
    if (!pharmacy) return res.status(404).json({ success: false, error: 'Pharmacy profile not found' });

    const { q, stockStatus, page = 1, limit = 50 } = req.query;

    const where: any = { pharmacyId: pharmacy.id };
    if (stockStatus) where.stockStatus = String(stockStatus);
    if (q) {
      const searchStr = String(q).trim();
      where.medicine = {
        OR: [
          { brandName: { contains: searchStr } },
          { genericName: { contains: searchStr } },
          { manufacturer: { contains: searchStr } }
        ]
      };
    }

    const [total, items, totalListed, inStockCount, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.pharmacyInventory.count({ where }),
      prisma.pharmacyInventory.findMany({
        where, include: { medicine: true },
        orderBy: { updatedAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.pharmacyInventory.count({ where: { pharmacyId: pharmacy.id } }),
      prisma.pharmacyInventory.count({ where: { pharmacyId: pharmacy.id, stockStatus: 'IN_STOCK' } }),
      prisma.pharmacyInventory.count({ where: { pharmacyId: pharmacy.id, stockStatus: 'LOW_STOCK' } }),
      prisma.pharmacyInventory.count({ where: { pharmacyId: pharmacy.id, stockStatus: 'OUT_OF_STOCK' } })
    ]);

    const formattedItems = items.map((item) => {
      let activeIngredientsArray: string[] = [];
      try { activeIngredientsArray = JSON.parse(item.medicine.activeIngredients); }
      catch { activeIngredientsArray = [item.medicine.activeIngredients]; }

      const { freshness, hoursAgo } = evaluateStockFreshness(item.updatedAt);
      return {
        ...item,
        freshness,
        freshnessHoursAgo: hoursAgo,
        medicine: { ...item.medicine, activeIngredients: activeIngredientsArray }
      };
    });

    return res.json({
      success: true,
      data: formattedItems,
      summary: { totalListed, inStockCount, lowStockCount, outOfStockCount, lastUpdated: items[0]?.updatedAt || pharmacy.updatedAt },
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function upsertInventoryItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const pharmacy = await prisma.pharmacy.findFirst({ where: { ownerId: req.user.id } });
    if (!pharmacy) return res.status(404).json({ success: false, error: 'Pharmacy profile not found' });

    const { medicineId, quantity, price, mrp, stockStatus } = req.body;

    const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
    if (!medicine) return res.status(404).json({ success: false, error: 'Medicine not found in catalog' });

    const computedStatus = stockStatus || calculateStockStatus(quantity);

    const existing = await prisma.pharmacyInventory.findUnique({
      where: { pharmacyId_medicineId: { pharmacyId: pharmacy.id, medicineId } }
    });

    const previousQuantity = existing?.quantity ?? 0;
    const previousPrice = existing?.price ?? price;

    const inventory = await prisma.pharmacyInventory.upsert({
      where: { pharmacyId_medicineId: { pharmacyId: pharmacy.id, medicineId } },
      update: { quantity, price, mrp, stockStatus: computedStatus, updatedAt: new Date() },
      create: { pharmacyId: pharmacy.id, medicineId, quantity, price, mrp, stockStatus: computedStatus },
      include: { medicine: true }
    });

    await prisma.stockAuditLog.create({
      data: {
        pharmacyId: pharmacy.id, medicineId,
        previousQuantity, newQuantity: quantity,
        previousPrice, newPrice: price,
        updatedBy: req.user.email
      }
    });

    broadcastStockUpdate(medicineId, {
      pharmacyId: pharmacy.id, pharmacyName: pharmacy.name,
      medicineName: medicine.brandName, quantity, price,
      stockStatus: computedStatus, updatedAt: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Inventory updated', data: inventory });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function bulkUpdateInventory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const pharmacy = await prisma.pharmacy.findFirst({ where: { ownerId: req.user.id } });
    if (!pharmacy) return res.status(404).json({ success: false, error: 'Pharmacy profile not found' });

    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Updates must be a non-empty array' });
    }

    const updatedRecords = [];
    for (const update of updates) {
      const computedStatus = calculateStockStatus(update.quantity);
      const record = await prisma.pharmacyInventory.upsert({
        where: { pharmacyId_medicineId: { pharmacyId: pharmacy.id, medicineId: update.medicineId } },
        update: { quantity: update.quantity, price: update.price, mrp: update.mrp, stockStatus: computedStatus, updatedAt: new Date() },
        create: { pharmacyId: pharmacy.id, medicineId: update.medicineId, quantity: update.quantity, price: update.price, mrp: update.mrp, stockStatus: computedStatus }
      });
      broadcastStockUpdate(update.medicineId, { pharmacyId: pharmacy.id, pharmacyName: pharmacy.name, quantity: update.quantity, price: update.price, stockStatus: computedStatus });
      updatedRecords.push(record);
    }

    return res.json({ success: true, message: `Updated ${updatedRecords.length} items`, data: updatedRecords });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteInventoryItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const pharmacy = await prisma.pharmacy.findFirst({ where: { ownerId: req.user.id } });
    if (!pharmacy) return res.status(404).json({ success: false, error: 'Pharmacy profile not found' });

    const existing = await prisma.pharmacyInventory.findFirst({ where: { id, pharmacyId: pharmacy.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Inventory listing not found' });

    await prisma.pharmacyInventory.delete({ where: { id } });
    broadcastStockUpdate(existing.medicineId, { pharmacyId: pharmacy.id, quantity: 0, stockStatus: 'OUT_OF_STOCK', removed: true });

    return res.json({ success: true, message: 'Medicine removed from inventory' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
