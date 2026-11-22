import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export async function searchMedicines(req: Request, res: Response) {
  try {
    const {
      q,
      genericName,
      brandName,
      category,
      dosageForm,
      prescriptionCategory,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (q) {
      const searchStr = String(q).trim();
      where.OR = [
        { brandName: { contains: searchStr } },
        { genericName: { contains: searchStr } },
        { activeIngredients: { contains: searchStr } },
        { manufacturer: { contains: searchStr } }
      ];
    }

    if (genericName) {
      where.genericName = { contains: String(genericName).trim() };
    }

    if (brandName) {
      where.brandName = { contains: String(brandName).trim() };
    }

    if (category) {
      where.category = { equals: String(category).trim() };
    }

    if (dosageForm) {
      where.dosageForm = { equals: String(dosageForm).trim() };
    }

    if (prescriptionCategory) {
      where.prescriptionCategory = { equals: String(prescriptionCategory).trim() };
    }

    const [total, medicines] = await Promise.all([
      prisma.medicine.count({ where }),
      prisma.medicine.findMany({
        where,
        skip,
        take,
        orderBy: { brandName: 'asc' },
        include: {
          inventories: {
            where: {
              quantity: { gt: 0 }
            },
            select: {
              id: true,
              price: true,
              mrp: true,
              stockStatus: true,
              pharmacy: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  verificationStatus: true
                }
              }
            }
          }
        }
      })
    ]);

    const formattedMedicines = medicines.map((med) => {
      let activeIngredientsArray: string[] = [];
      try {
        activeIngredientsArray = JSON.parse(med.activeIngredients);
      } catch {
        activeIngredientsArray = [med.activeIngredients];
      }

      const availablePharmaciesCount = med.inventories.filter(
        (inv) => inv.pharmacy.verificationStatus === 'VERIFIED'
      ).length;

      const lowestPrice = med.inventories.length > 0
        ? Math.min(...med.inventories.map((i) => i.price))
        : null;

      return {
        ...med,
        activeIngredients: activeIngredientsArray,
        availablePharmaciesCount,
        lowestPrice,
        inventories: undefined // Clean up
      };
    });

    return res.json({
      success: true,
      data: formattedMedicines,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMedicineById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        inventories: {
          where: {
            pharmacy: {
              isActive: true,
              verificationStatus: 'VERIFIED'
            }
          },
          include: {
            pharmacy: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                state: true,
                postalCode: true,
                latitude: true,
                longitude: true,
                phone: true,
                openingHours: true,
                verificationStatus: true,
                rating: true
              }
            }
          }
        }
      }
    });

    if (!medicine) {
      return res.status(404).json({ success: false, error: 'Medicine not found' });
    }

    let activeIngredientsArray: string[] = [];
    try {
      activeIngredientsArray = JSON.parse(medicine.activeIngredients);
    } catch {
      activeIngredientsArray = [medicine.activeIngredients];
    }

    return res.json({
      success: true,
      data: {
        ...medicine,
        activeIngredients: activeIngredientsArray
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMedicineSuggestions(req: Request, res: Response) {
  try {
    const { q } = req.query;
    if (!q || String(q).trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchStr = String(q).trim();
    const suggestions = await prisma.medicine.findMany({
      where: {
        OR: [
          { brandName: { contains: searchStr } },
          { genericName: { contains: searchStr } }
        ]
      },
      take: 8,
      select: {
        id: true,
        brandName: true,
        genericName: true,
        strength: true,
        dosageForm: true,
        manufacturer: true,
        category: true
      }
    });

    return res.json({
      success: true,
      data: suggestions
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMedicineCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.medicine.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    return res.json({
      success: true,
      data: categories.map((cat) => ({
        name: cat.category,
        count: cat._count.id
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
