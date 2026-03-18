import { Router } from 'express';
import { getReport } from './report.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const reportRoutes = Router({ mergeParams: true });
reportRoutes.get('/', authMiddleware, getReport);
