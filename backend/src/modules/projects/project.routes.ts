import { Router } from 'express';
import { ProjectController } from './project.controller';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createProjectSchema, updateProjectSchema } from './project.validation';

const router = Router();

router.use(requireAuth);

router.get('/', ProjectController.list);
router.post('/', validateBody(createProjectSchema), ProjectController.create);
router.get('/:projectId', ProjectController.getById);
router.patch('/:projectId', validateBody(updateProjectSchema), ProjectController.update);
router.delete('/:projectId', ProjectController.delete);

export default router;
