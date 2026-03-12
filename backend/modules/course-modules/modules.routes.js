// modules/course-modules/modules.routes.js
import { Router } from 'express';
import { createModule, getModulesByCourse, getModuleById, updateModule, deleteModule } from './modules.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { createModuleSchema, updateModuleSchema } from './modules.schemas.js';

export const modulesRoutes = Router({ mergeParams: true });

modulesRoutes.post('/', authMiddleware, validateSchema(createModuleSchema), createModule);
modulesRoutes.get('/', authMiddleware, getModulesByCourse);
modulesRoutes.get('/:id', authMiddleware, getModuleById);
modulesRoutes.put('/:id', authMiddleware, validateSchema(updateModuleSchema), updateModule);
modulesRoutes.delete('/:id', authMiddleware, deleteModule);