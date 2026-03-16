import { Router } from 'express';
import {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    updateProjectStatus,
    deleteProject,
} from './projects.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import {
    createProjectSchema,
    updateProjectSchema,
    updateProjectStatusSchema,
} from './projects.schemas.js';

export const projectsRoutes = Router();

projectsRoutes.get('/',              authMiddleware, getProjects);
projectsRoutes.get('/:id',           authMiddleware, getProjectById);
projectsRoutes.post('/',             authMiddleware, validateSchema(createProjectSchema), createProject);
projectsRoutes.put('/:id',           authMiddleware, validateSchema(updateProjectSchema), updateProject);
projectsRoutes.patch('/:id/status',  authMiddleware, validateSchema(updateProjectStatusSchema), updateProjectStatus);
projectsRoutes.delete('/:id',        authMiddleware, deleteProject);
