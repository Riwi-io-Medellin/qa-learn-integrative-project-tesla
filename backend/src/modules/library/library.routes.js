// modules/library/library.routes.js
import { Router } from 'express';
import { createLibraryTest, getAllLibraryTests, getLibraryTestById, updateLibraryTest, deleteLibraryTest } from './library.controller.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { createLibrarySchema, updateLibrarySchema } from './library.schemas.js';

export const libraryRoutes = Router();

libraryRoutes.get('/', authMiddleware, getAllLibraryTests);
libraryRoutes.get('/:id', authMiddleware, getLibraryTestById);
libraryRoutes.post('/', authMiddleware, requireRole('ADMIN'), validateSchema(createLibrarySchema), createLibraryTest);
libraryRoutes.put('/:id', authMiddleware, requireRole('ADMIN'), validateSchema(updateLibrarySchema), updateLibraryTest);
libraryRoutes.delete('/:id', authMiddleware, requireRole('ADMIN'), deleteLibraryTest);