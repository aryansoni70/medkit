import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateHaversineDistanceKm, evaluateStockFreshness } from '../shared';

export async function getNearbyPharmacies(req: Request, res: Response) {
  try {
    const {
      medicineId,
      lat,
      lng,
      radiusKm = 5,
      sortBy = 'distance',
      inStockOnly = 'false',
      page = 1,
      limit = 20
    } = req.query;

    // Default coordinates: Vijay Nagar, Indore
    const userLat = lat ? Number(lat) : 22.7533;
    const userLng = lng ? Number(lng) : 75.8937;
    const searchRadius = Number(radiusKm) || 5;
    const filterInStock = inStockOnly === 'true' || inStockOnly === true;

    const pharmacyWhere: any = { isActive: true, verificationStatus: 'VERIFIED' };

    const pharmacies = await prisma.pharmacy.findMany({
      where: pharmacyWhere,
      include: medicineId
        ? {
            inventories: {
              where: { medicineId: String(medicineId) },
              include: {
                medicine: {
                  select: { id: true, brandName: true, genericName: true, strength: true, dosageForm: true, packSize: true }
                }
              }
            }
          }
        : { inventories: false }
    });

    const results: any[] = [];
    const allCalculatedPharmacies: any[] = [];

    for (const pharmacy of pharmacies) {
      const distance = calculateHaversineDistanceKm(
        userLat, userLng, pharmacy.latitude, pharmacy.longitude
      );

      let inventoryInfo = null;

      if (medicineId) {
        const inv = pharmacy.inventories && pharmacy.inventories.length > 0
          ? pharmacy.inventories[0]
          : null;

        if (filterInStock && (!inv || inv.quantity <= 0)) continue;

        if (inv) {
          const { freshness, hoursAgo } = evaluateStockFreshness(inv.updatedAt);
          inventoryInfo = {
            id: inv.id,
            medicineId: inv.medicineId,
            quantity: inv.quantity,
            price: inv.price,
            mrp: inv.mrp,
            stockStatus: inv.stockStatus,
            lastUpdated: inv.updatedAt.toISOString(),
            freshness,
            freshnessHoursAgo: hoursAgo,
            medicine: inv.medicine
          };
        } else {
          if (filterInStock) continue;
          inventoryInfo = {
            id: '',
            medicineId: String(medicineId),
            quantity: 0,
            price: 0,
            mrp: 0,
            stockStatus: 'OUT_OF_STOCK',
            lastUpdated: pharmacy.updatedAt.toISOString(),
            freshness: 'UNCONFIRMED',
            freshnessHoursAgo: 999,
            medicine: null
          };
        }
      }

      const estimatedDriveTimeMinutes = Math.max(3, Math.round(distance * 2.8));
      const { inventories: _, ...pharmacyDetails } = pharmacy as any;

      const item = {
        pharmacy: pharmacyDetails,
        distanceKm: distance,
        estimatedDriveTimeMinutes,
        inventory: inventoryInfo
      };

      allCalculatedPharmacies.push(item);

      if (distance <= searchRadius) {
        results.push(item);
      }
    }

    let isExpandedFallback = false;
    let effectiveResults = results;

    // Smart Fallback: If 0 pharmacies found in strict radius, provide nearest available stores
    if (results.length === 0 && allCalculatedPharmacies.length > 0) {
      // Sort all by distance
      allCalculatedPharmacies.sort((a, b) => a.distanceKm - b.distanceKm);
      // Take the top 5 nearest pharmacies
      effectiveResults = allCalculatedPharmacies.slice(0, 6);
      isExpandedFallback = true;
    }

    if (sortBy === 'distance') {
      effectiveResults.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'price' && medicineId) {
      effectiveResults.sort((a, b) => (a.inventory?.price || 999999) - (b.inventory?.price || 999999));
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedResults = effectiveResults.slice(startIndex, startIndex + Number(limit));
    const nearestDistanceKm = allCalculatedPharmacies.length > 0
      ? Math.min(...allCalculatedPharmacies.map((p) => p.distanceKm))
      : null;

    return res.json({
      success: true,
      data: paginatedResults,
      meta: {
        total: effectiveResults.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(effectiveResults.length / Number(limit)),
        userCoordinates: { lat: userLat, lng: userLng },
        searchRadiusKm: searchRadius,
        isExpandedFallback,
        nearestDistanceKm
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPharmacyById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: {
        inventories: {
          where: { quantity: { gt: 0 } },
          include: { medicine: true },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    if (!pharmacy) return res.status(404).json({ success: false, error: 'Pharmacy not found' });

    const formattedInventories = pharmacy.inventories.map((inv) => {
      let activeIngredientsArray: string[] = [];
      try { activeIngredientsArray = JSON.parse(inv.medicine.activeIngredients); }
      catch { activeIngredientsArray = [inv.medicine.activeIngredients]; }

      const { freshness, hoursAgo } = evaluateStockFreshness(inv.updatedAt);
      return {
        ...inv,
        freshness,
        freshnessHoursAgo: hoursAgo,
        medicine: { ...inv.medicine, activeIngredients: activeIngredientsArray }
      };
    });

    return res.json({ success: true, data: { ...pharmacy, inventories: formattedInventories } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function registerPharmacy(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { name, address, city, state, postalCode, latitude, longitude, phone, email, openingHours, licenseNumber } = req.body;

    const existingLicense = await prisma.pharmacy.findUnique({ where: { licenseNumber } });
    if (existingLicense) {
      return res.status(400).json({ success: false, error: 'A pharmacy with this Drug License Number is already registered' });
    }

    const pharmacy = await prisma.pharmacy.create({
      data: {
        ownerId: req.user.id, name, address, city, state, postalCode,
        latitude, longitude, phone, email: email || req.user.email,
        openingHours: openingHours || '08:00 AM - 10:00 PM', licenseNumber,
        verificationStatus: 'PENDING', isActive: true
      }
    });

    await prisma.user.update({ where: { id: req.user.id }, data: { role: 'PHARMACY' } });

    return res.status(201).json({
      success: true,
      message: 'Pharmacy registration submitted. Pending admin verification.',
      data: pharmacy
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPharmacyMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const pharmacy = await prisma.pharmacy.findFirst({
      where: { ownerId: req.user.id },
      include: { _count: { select: { inventories: true, reservations: true } } }
    });

    if (!pharmacy) return res.status(404).json({ success: false, error: 'No pharmacy found for this account' });
    return res.json({ success: true, data: pharmacy });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePharmacyMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const pharmacy = await prisma.pharmacy.findFirst({ where: { ownerId: req.user.id } });
    if (!pharmacy) return res.status(404).json({ success: false, error: 'No pharmacy found' });

    const { name, address, city, state, postalCode, latitude, longitude, phone, email, openingHours } = req.body;

    const updated = await prisma.pharmacy.update({
      where: { id: pharmacy.id },
      data: { name, address, city, state, postalCode, latitude, longitude, phone, email, openingHours }
    });

    return res.json({ success: true, message: 'Pharmacy updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
