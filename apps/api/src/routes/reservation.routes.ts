import { Router } from 'express';
import {
  createReservation,
  getMyReservations,
  updateReservationStatus
} from '../controllers/reservation.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.post('/', createReservation);
router.get('/me', getMyReservations);
router.patch('/:id/status', updateReservationStatus);

export default router;
