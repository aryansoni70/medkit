import { Router } from 'express';
import {
  getPharmacyInventory,
  upsertInventoryItem,
  bulkUpdateInventory,
  deleteInventoryItem
} from '../controllers/inventory.controller';
import { authenticateUser, requireRoles } from '../middleware/auth';
import { Role } from '../shared';

const router = Router();

router.use(authenticateUser);
router.use(requireRoles(Role.PHARMACY, Role.ADMIN));

router.get('/pharmacy/me', getPharmacyInventory);
router.post('/', upsertInventoryItem);
router.patch('/bulk', bulkUpdateInventory);
router.delete('/:id', deleteInventoryItem);

export default router;
