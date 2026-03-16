// modules/courses/courses.routes.js
import { Router } from 'express';
import * as coursesController from './courses.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { createCourseSchema, updateCourseSchema } from './courses.schemas.js';
import { requireRole } from '../../middlewares/role.middleware.js';

export const coursesRoutes = Router();

coursesRoutes.get('/', authMiddleware, coursesController.getAllCourses);
coursesRoutes.get('/:id', authMiddleware, coursesController.getCourseById);
coursesRoutes.post('/', authMiddleware, requireRole('ADMIN'), validateSchema(createCourseSchema), coursesController.createCourse);
coursesRoutes.put('/:id', authMiddleware, requireRole('ADMIN'), validateSchema(updateCourseSchema), coursesController.updateCourse);
coursesRoutes.patch('/:id/status', authMiddleware, requireRole('ADMIN'), coursesController.updateCourseStatus);
coursesRoutes.delete('/:id', authMiddleware, requireRole('ADMIN'), coursesController.deleteCourse);