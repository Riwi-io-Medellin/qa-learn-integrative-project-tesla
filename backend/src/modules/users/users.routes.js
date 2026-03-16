import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { updateUserStatusSchema } from './users.schemas.js';

export const usersRoutes = Router();

usersRoutes.get('/', authMiddleware, requireRole('ADMIN'), usersController.getAllUsers);
usersRoutes.get('/:id', authMiddleware, requireRole('ADMIN'), usersController.getUserById);
usersRoutes.patch('/:id/status', authMiddleware, requireRole('ADMIN'), validateSchema(updateUserStatusSchema), usersController.updateUserStatus);
usersRoutes.delete('/:id', authMiddleware, requireRole('ADMIN'), usersController.deleteUser);