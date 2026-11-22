import { Router } from 'express';
import authRoutes from './auth.routes';
import medicineRoutes from './medicine.routes';
import pharmacyRoutes from './pharmacy.routes';
import inventoryRoutes from './inventory.routes';
import adminRoutes from './admin.routes';
import reservationRoutes from './reservation.routes';
import customerRoutes from './customer.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/medicines', medicineRoutes);
router.use('/pharmacies', pharmacyRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/admin', adminRoutes);
router.use('/reservations', reservationRoutes);
router.use('/users/me', customerRoutes);

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MediNear API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
