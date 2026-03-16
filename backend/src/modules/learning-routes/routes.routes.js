import { Router } from 'express';
import * as routesController from './routes.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { createRouteSchema, updateRouteSchema, addCourseToRouteSchema } from './routes.schemas.js';

export const learningRoutes = Router();

learningRoutes.get('/', authMiddleware, routesController.getAllRoutes);
learningRoutes.get('/:id', authMiddleware, routesController.getRouteById);
learningRoutes.post('/', authMiddleware, requireRole('ADMIN'), validateSchema(createRouteSchema), routesController.createRoute);
learningRoutes.put('/:id', authMiddleware, requireRole('ADMIN'), validateSchema(updateRouteSchema), routesController.updateRoute);
learningRoutes.delete('/:id', authMiddleware, requireRole('ADMIN'), routesController.deleteRoute);
learningRoutes.post('/:id/courses', authMiddleware, requireRole('ADMIN'), validateSchema(addCourseToRouteSchema), routesController.addCourseToRoute);
learningRoutes.delete('/:id/courses/:courseId', authMiddleware, requireRole('ADMIN'), routesController.removeCourseFromRoute);