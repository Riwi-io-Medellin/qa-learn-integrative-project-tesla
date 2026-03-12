import { Router } from 'express';
import { getProjectById, updateProject } from './projects.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { updateProjectSchema } from './projects.schemas.js';

export const projectsRoutes = Router();

projectsRoutes.get('/:id',  authMiddleware, getProjectById);
projectsRoutes.put('/:id',  authMiddleware, validateSchema(updateProjectSchema), updateProject);
