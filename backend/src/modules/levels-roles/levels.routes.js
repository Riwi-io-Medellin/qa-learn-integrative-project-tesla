import { Router } from 'express';
import * as levelsController from './levels.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

export const levelsRoutes = Router();

levelsRoutes.get('/levels', authMiddleware, levelsController.getAllLevels);
levelsRoutes.get('/roles', authMiddleware, requireRole('ADMIN'), levelsController.getAllRoles);