import { Router } from 'express';
import { ResourceController } from './resource.controller';
import { requireAuth } from '../../middleware/auth';
import { validateBody, validateQuery } from '../../middleware/validate';
import {
  createResourceSchema,
  updateResourceSchema,
  importResourceSchema,
  listResourcesQuerySchema,
} from './resource.validation';

const router = Router();

router.use(requireAuth);

router.get('/stats', ResourceController.getStats);
router.get('/counts', ResourceController.getStats);
router.get('/recent', ResourceController.getRecent);
router.get('/favourites', ResourceController.getFavourites);
router.get('/favorites', ResourceController.getFavourites);

router.get('/', validateQuery(listResourcesQuerySchema), ResourceController.list);
router.get('/check-duplicate', ResourceController.checkDuplicate);
router.get('/preview/meta', ResourceController.fetchMetadata);
router.post('/', validateBody(createResourceSchema), ResourceController.create);
router.post('/import', validateBody(importResourceSchema), ResourceController.import);

router.get('/trash', ResourceController.listTrash);
router.delete('/trash', ResourceController.emptyTrash);

router.get('/:resourceId', ResourceController.getById);
router.patch('/:resourceId', validateBody(updateResourceSchema), ResourceController.update);
router.put('/:resourceId', validateBody(updateResourceSchema), ResourceController.update);
router.delete('/:resourceId', ResourceController.moveToTrash);
router.delete('/:resourceId/permanent', ResourceController.deletePermanently);

router.patch('/:resourceId/favourite', ResourceController.toggleFavourite);
router.patch('/:resourceId/favorite', ResourceController.toggleFavourite);
router.patch('/:resourceId/archive', ResourceController.archive);
router.patch('/:resourceId/restore', ResourceController.restore);
router.post('/:resourceId/refresh-metadata', ResourceController.refreshMetadata);

export default router;
