import { Router } from 'express';
import { getSearchHistory, recordSearchHistory } from '../controllers/customer.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/search-history', optionalAuth, getSearchHistory);
router.post('/search-history', optionalAuth, recordSearchHistory);

export default router;
