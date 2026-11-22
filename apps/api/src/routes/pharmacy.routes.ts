import { Router } from 'express';
import {
  getNearbyPharmacies,
  getPharmacyById,
  getAllPharmacies,
  createManualPharmacy,
  registerPharmacy,
  getPharmacyMe,
  updatePharmacyMe
} from '../controllers/pharmacy.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/all', getAllPharmacies);
router.post('/manual', createManualPharmacy);
router.get('/nearby', getNearbyPharmacies);
router.get('/me', authenticateUser, getPharmacyMe);
router.patch('/me', authenticateUser, updatePharmacyMe);
router.post('/register', authenticateUser, registerPharmacy);
router.get('/:id', getPharmacyById);

export default router;
