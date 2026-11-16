import { Router } from 'express';
import { SearchController } from './search.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', SearchController.search);

export default router;
