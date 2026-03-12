// modules/library/library.routes.js
import { Router } from 'express';
import { createLibraryTest, getAllLibraryTests, getLibraryTestById, updateLibraryTest, deleteLibraryTest } from './library.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { createLibrarySchema, updateLibrarySchema } from './library.schemas.js';

export const libraryRoutes = Router();

libraryRoutes.post('/', authMiddleware, validateSchema(createLibrarySchema), createLibraryTest);
libraryRoutes.get('/', authMiddleware, getAllLibraryTests);
libraryRoutes.get('/:id', authMiddleware, getLibraryTestById);
libraryRoutes.put('/:id', authMiddleware, validateSchema(updateLibrarySchema), updateLibraryTest);
libraryRoutes.delete('/:id', authMiddleware, deleteLibraryTest);