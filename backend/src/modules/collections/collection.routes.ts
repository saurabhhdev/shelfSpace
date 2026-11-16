import { Router } from 'express';
import { CollectionController } from './collection.controller';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createCollectionSchema, updateCollectionSchema } from './collection.validation';

const router = Router();

router.use(requireAuth);

router.get('/', CollectionController.list);
router.post('/', validateBody(createCollectionSchema), CollectionController.create);
router.get('/:collectionId', CollectionController.getById);
router.patch('/:collectionId', validateBody(updateCollectionSchema), CollectionController.update);
router.delete('/:collectionId', CollectionController.delete);

export default router;
