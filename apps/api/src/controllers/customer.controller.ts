import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getSearchHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({ success: true, data: [] });
    }

    const history = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { searchedAt: 'desc' },
      take: 10,
      include: {
        medicine: {
          select: {
            id: true,
            brandName: true,
            genericName: true,
            strength: true,
            category: true
          }
        }
      }
    });

    return res.json({
      success: true,
      data: history
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function recordSearchHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const { query, medicineId } = req.body;
    const userId = req.user?.id || null;

    if (!query && !medicineId) {
      return res.status(400).json({ success: false, error: 'Query or medicineId required' });
    }

    const record = await prisma.searchHistory.create({
      data: {
        userId,
        medicineId: medicineId || null,
        query: query || ''
      }
    });

    return res.status(201).json({
      success: true,
      data: record
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
