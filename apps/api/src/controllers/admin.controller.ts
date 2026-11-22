import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getDashboardStats(_req: AuthenticatedRequest, res: Response) {
  try {
    const [
      totalUsers,
      totalPharmacies,
      verifiedPharmacies,
      pendingPharmacies,
      totalMedicines,
      totalInventoryListings,
      recentAuditLogs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.pharmacy.count(),
      prisma.pharmacy.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.pharmacy.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.medicine.count(),
      prisma.pharmacyInventory.count(),
      prisma.stockAuditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          pharmacy: { select: { id: true, name: true, city: true } },
          medicine: { select: { id: true, brandName: true, strength: true } }
        }
      })
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalPharmacies,
        verifiedPharmacies,
        pendingPharmacies,
        totalMedicines,
        totalInventoryListings,
        recentAuditLogs
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAdminPharmacies(req: Request, res: Response) {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (status) {
      where.verificationStatus = String(status);
    }

    if (q) {
      const searchStr = String(q).trim();
      where.OR = [
        { name: { contains: searchStr } },
        { licenseNumber: { contains: searchStr } },
        { city: { contains: searchStr } },
        { phone: { contains: searchStr } }
      ];
    }

    const [total, pharmacies] = await Promise.all([
      prisma.pharmacy.count({ where }),
      prisma.pharmacy.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, email: true, phone: true }
          },
          _count: {
            select: { inventories: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      })
    ]);

    return res.json({
      success: true,
      data: pharmacies,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePharmacyVerification(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    const updated = await prisma.pharmacy.update({
      where: { id },
      data: {
        verificationStatus
      }
    });

    return res.json({
      success: true,
      message: `Pharmacy verification status updated to ${verificationStatus}`,
      data: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAdminMedicines(req: Request, res: Response) {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (q) {
      const searchStr = String(q).trim();
      where.OR = [
        { brandName: { contains: searchStr } },
        { genericName: { contains: searchStr } },
        { manufacturer: { contains: searchStr } }
      ];
    }

    if (category) {
      where.category = String(category);
    }

    const [total, medicines] = await Promise.all([
      prisma.medicine.count({ where }),
      prisma.medicine.findMany({
        where,
        orderBy: { brandName: 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          _count: {
            select: { inventories: true }
          }
        }
      })
    ]);

    const formatted = medicines.map((med) => {
      let activeIngredientsArray: string[] = [];
      try {
        activeIngredientsArray = JSON.parse(med.activeIngredients);
      } catch {
        activeIngredientsArray = [med.activeIngredients];
      }

      return {
        ...med,
        activeIngredients: activeIngredientsArray
      };
    });

    return res.json({
      success: true,
      data: formatted,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createMedicine(req: Request, res: Response) {
  try {
    const {
      registryCode,
      brandName,
      genericName,
      activeIngredients,
      strength,
      dosageForm,
      manufacturer,
      packSize,
      prescriptionCategory,
      category,
      description,
      storageConditions
    } = req.body;

    const existing = await prisma.medicine.findUnique({
      where: { registryCode }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'A medicine with this registry code already exists'
      });
    }

    const medicine = await prisma.medicine.create({
      data: {
        registryCode,
        brandName,
        genericName,
        activeIngredients: JSON.stringify(
          Array.isArray(activeIngredients) ? activeIngredients : [activeIngredients]
        ),
        strength,
        dosageForm,
        manufacturer,
        packSize,
        prescriptionCategory,
        category,
        description,
        storageConditions
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Medicine added to catalogue',
      data: medicine
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateMedicine(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.activeIngredients && Array.isArray(data.activeIngredients)) {
      data.activeIngredients = JSON.stringify(data.activeIngredients);
    }

    const updated = await prisma.medicine.update({
      where: { id },
      data
    });

    return res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { page = 1, limit = 50 } = req.query;

    const [total, logs] = await Promise.all([
      prisma.stockAuditLog.count(),
      prisma.stockAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          pharmacy: { select: { id: true, name: true, city: true } },
          medicine: { select: { id: true, brandName: true, strength: true } }
        }
      })
    ]);

    return res.json({
      success: true,
      data: logs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
