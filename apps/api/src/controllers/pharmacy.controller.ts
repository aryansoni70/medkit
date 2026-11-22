import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateHaversineDistanceKm, evaluateStockFreshness } from '../shared';

// Pre-mapped coordinates for common Indore areas for manual store additions
const INDORE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Vijay Nagar': { lat: 22.7533, lng: 75.8937 },
  'Old Palasia': { lat: 22.7244, lng: 75.8839 },
  'New Palasia': { lat: 22.7225, lng: 75.8785 },
  'Bhawarkua': { lat: 22.6926, lng: 75.8676 },
  'Rajwada': { lat: 22.7185, lng: 75.8550 },
  'Geeta Bhawan': { lat: 22.7167, lng: 75.8828 },
  'Annapurna': { lat: 22.6974, lng: 75.8322 },
  'MR-10': { lat: 22.7661, lng: 75.8753 },
  'Dawa Bazar': { lat: 22.7150, lng: 75.8650 },
  'Sudama Nagar': { lat: 22.6890, lng: 75.8280 },
  'LIG Square': { lat: 22.7350, lng: 75.8850 },
  'Rau': { lat: 22.6372, lng: 75.8038 }
};

export async function getAllPharmacies(_req: Request, res: Response) {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { inventories: true, reservations: true } },
        inventories: {
          take: 5,
          include: {
            medicine: { select: { id: true, brandName: true, strength: true, dosageForm: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: pharmacies,
      total: pharmacies.length
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createManualPharmacy(req: Request, res: Response) {
  try {
    const {
      name,
      address,
      locality,
      city = 'Indore',
      state = 'Madhya Pradesh',
      postalCode = '452001',
      latitude,
      longitude,
      phone,
      email,
      openingHours = '24 Hours Open',
      licenseNumber,
      stockInitialDolo = true
    } = req.body;

    if (!name || !address || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Store name, address, and phone number are required.'
      });
    }

    // Determine coordinates based on locality or defaults
    let finalLat = latitude ? Number(latitude) : 22.7533;
    let finalLng = longitude ? Number(longitude) : 75.8937;

    if (!latitude && locality && INDORE_COORDINATES[locality]) {
      finalLat = INDORE_COORDINATES[locality].lat;
      finalLng = INDORE_COORDINATES[locality].lng;
    }

    // Find or create default admin/pharmacy owner
    let owner = await prisma.user.findFirst({ where: { role: 'PHARMACY' } });
    if (!owner) {
      owner = await prisma.user.findFirst();
    }

    if (!owner) {
      return res.status(500).json({ success: false, error: 'System owner user not found.' });
    }

    const finalLicense = licenseNumber || `MP-IND-20B-${Math.floor(100000 + Math.random() * 900000)}/2026`;

    const newPharmacy = await prisma.pharmacy.create({
      data: {
        ownerId: owner.id,
        name,
        address,
        city,
        state,
        postalCode,
        latitude: finalLat,
        longitude: finalLng,
        phone,
        email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@medkit.in`,
        openingHours,
        licenseNumber: finalLicense,
        verificationStatus: 'VERIFIED',
        isActive: true,
        rating: 4.8
      }
    });

    // Automatically stock Dolo 650 and top 3 medicines so it's immediately active in searches
    if (stockInitialDolo) {
      const topMedicines = await prisma.medicine.findMany({ take: 5 });
      for (const med of topMedicines) {
        await prisma.pharmacyInventory.create({
          data: {
            pharmacyId: newPharmacy.id,
            medicineId: med.id,
            quantity: 50,
            price: 29.00,
            mrp: 33.50,
            stockStatus: 'IN_STOCK'
          }
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Medical store successfully added and verified!',
      data: newPharmacy
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

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
    const filterInStock = String(inStockOnly) === 'true';

    const pharmacies = await prisma.pharmacy.findMany({
      where: { isActive: true },
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
        : {
            inventories: {
              take: 1,
              include: {
                medicine: {
                  select: { id: true, brandName: true, strength: true }
                }
              }
            }
          }
    });

    const withinRadius: any[] = [];
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

      // Always collect all pharmacies for guaranteed raw data delivery
      allCalculatedPharmacies.push(item);

      // Only skip from withinRadius if inStockOnly filter applies
      const isAvailable = !filterInStock || (inventoryInfo && inventoryInfo.quantity > 0);
      if (distance <= searchRadius && isAvailable) {
        withinRadius.push(item);
      }
    }

    let isExpandedFallback = false;
    let effectiveResults = withinRadius;

    // ALWAYS ensure at least the nearest pharmacies are returned so user is never left with an empty list
    if (withinRadius.length === 0 && allCalculatedPharmacies.length > 0) {
      allCalculatedPharmacies.sort((a, b) => a.distanceKm - b.distanceKm);
      // Return all calculated pharmacies up to 15
      effectiveResults = allCalculatedPharmacies.slice(0, 15);
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
      allStores: allCalculatedPharmacies.sort((a, b) => a.distanceKm - b.distanceKm),
      meta: {
        total: effectiveResults.length,
        totalInRegion: allCalculatedPharmacies.length,
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
