import { Router } from 'express';
import {
  getDashboardStats,
  getAdminPharmacies,
  updatePharmacyVerification,
  getAdminMedicines,
  createMedicine,
  updateMedicine,
  getAuditLogs
} from '../controllers/admin.controller';
import { authenticateUser, requireRoles } from '../middleware/auth';
import { Role } from '../shared';

const router = Router();

router.use(authenticateUser);
router.use(requireRoles(Role.ADMIN));

router.get('/dashboard', getDashboardStats);
router.get('/pharmacies', getAdminPharmacies);
router.patch('/pharmacies/:id/verification', updatePharmacyVerification);
router.get('/medicines', getAdminMedicines);
router.post('/medicines', createMedicine);
router.patch('/medicines/:id', updateMedicine);
router.get('/audit-logs', getAuditLogs);

export default router;
