import { Router } from 'express';
import { ProjectController } from './project.controller';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  addResourcesToProjectSchema,
} from './project.validation';

const router = Router();

router.use(requireAuth);

router.get('/', ProjectController.list);
router.post('/', validateBody(createProjectSchema), ProjectController.create);
router.get('/:projectId', ProjectController.getById);
router.patch('/:projectId', validateBody(updateProjectSchema), ProjectController.update);
router.patch('/:projectId/archive', ProjectController.toggleArchive);
router.delete('/:projectId', ProjectController.delete);

// Resource association routes
router.post('/:projectId/resources', validateBody(addResourcesToProjectSchema), ProjectController.addResources);
router.delete('/:projectId/resources/:resourceId', ProjectController.removeResource);

export default router;
