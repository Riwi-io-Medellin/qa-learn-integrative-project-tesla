// modules/courses/courses.routes.js
import { Router } from 'express';
import { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse } from './courses.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { createCourseSchema, updateCourseSchema } from './courses.schemas.js';

export const coursesRoutes = Router();

coursesRoutes.post('/', authMiddleware, validateSchema(createCourseSchema), createCourse);
coursesRoutes.get('/', authMiddleware, getAllCourses);
coursesRoutes.get('/:id', authMiddleware, getCourseById);
coursesRoutes.put('/:id', authMiddleware, validateSchema(updateCourseSchema), updateCourse);
coursesRoutes.delete('/:id', authMiddleware, deleteCourse);