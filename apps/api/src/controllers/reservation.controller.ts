import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function createReservation(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { pharmacyId, medicineId, quantity = 1 } = req.body;

    const inventory = await prisma.pharmacyInventory.findUnique({
      where: {
        pharmacyId_medicineId: {
          pharmacyId,
          medicineId
        }
      },
      include: {
        pharmacy: true,
        medicine: true
      }
    });

    if (!inventory || inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Medicine is currently out of stock or insufficient quantity at this pharmacy'
      });
    }

    // Reservation valid for 2 hours
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const reservation = await prisma.reservation.create({
      data: {
        customerId: req.user.id,
        pharmacyId,
        medicineId,
        quantity,
        status: 'PENDING',
        expiresAt
      },
      include: {
        pharmacy: { select: { id: true, name: true, phone: true, address: true } },
        medicine: { select: { id: true, brandName: true, strength: true, dosageForm: true } }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Hold request placed. Pharmacy will hold the medicine for 2 hours.',
      data: reservation
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMyReservations(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    let where: any = {};

    if (req.user.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    } else if (req.user.role === 'PHARMACY') {
      const pharmacy = await prisma.pharmacy.findFirst({
        where: { ownerId: req.user.id }
      });
      if (!pharmacy) {
        return res.json({ success: true, data: [] });
      }
      where.pharmacyId = pharmacy.id;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        pharmacy: { select: { id: true, name: true, phone: true, address: true } },
        medicine: { select: { id: true, brandName: true, strength: true, dosageForm: true } }
      }
    });

    return res.json({
      success: true,
      data: reservations
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateReservationStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status } = req.body; // CONFIRMED, COMPLETED, CANCELLED

    const reservation = await prisma.reservation.findUnique({
      where: { id }
    });

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status }
    });

    return res.json({
      success: true,
      message: `Reservation status updated to ${status}`,
      data: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
