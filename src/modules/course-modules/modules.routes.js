// modules/course-modules/modules.routes.js
import { Router } from 'express';
import { createModule, getModulesByCourse, getModuleById, updateModule, deleteModule } from './modules.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { createModuleSchema, updateModuleSchema } from './modules.schemas.js';

export const modulesRoutes = Router({ mergeParams: true });

modulesRoutes.get('/', authMiddleware, getModulesByCourse);
modulesRoutes.get('/:id', authMiddleware, getModuleById);
modulesRoutes.post('/', authMiddleware, requireRole('ADMIN'), validateSchema(createModuleSchema), createModule);
modulesRoutes.put('/:id', authMiddleware, requireRole('ADMIN'), validateSchema(updateModuleSchema), updateModule);
modulesRoutes.delete('/:id', authMiddleware, requireRole('ADMIN'), deleteModule);