import { Router } from 'express';
import {
  searchMedicines,
  getMedicineById,
  getMedicineSuggestions,
  getMedicineCategories
} from '../controllers/medicine.controller';

const router = Router();

router.get('/', searchMedicines);
router.get('/search', searchMedicines);
router.get('/suggest', getMedicineSuggestions);
router.get('/categories', getMedicineCategories);
router.get('/:id', getMedicineById);

export default router;
