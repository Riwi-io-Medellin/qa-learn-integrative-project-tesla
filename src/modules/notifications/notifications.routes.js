import { Router } from 'express';
import {
    getNotifications,
    getUnreadNotifications,
    markAsRead,
    deleteNotification,
} from './notifications.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const notificationsRoutes = Router();

// GET  /api/notifications           → todas las notificaciones del usuario
notificationsRoutes.get('/',           authMiddleware, getNotifications);

// GET  /api/notifications/unread     → solo las no leídas
notificationsRoutes.get('/unread',     authMiddleware, getUnreadNotifications);

// PATCH /api/notifications/:id/read  → marcar una como leída
notificationsRoutes.patch('/:id/read', authMiddleware, markAsRead);

// DELETE /api/notifications/:id      → eliminar una
notificationsRoutes.delete('/:id',     authMiddleware, deleteNotification);
