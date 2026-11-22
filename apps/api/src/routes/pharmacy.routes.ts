import { Router } from 'express';
import {
  getNearbyPharmacies,
  getPharmacyById,
  registerPharmacy,
  getPharmacyMe,
  updatePharmacyMe
} from '../controllers/pharmacy.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/nearby', getNearbyPharmacies);
router.get('/me', authenticateUser, getPharmacyMe);
router.patch('/me', authenticateUser, updatePharmacyMe);
router.post('/register', authenticateUser, registerPharmacy);
router.get('/:id', getPharmacyById);

export default router;
