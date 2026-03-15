import * as notificationsRepository from './notifications.repository.js';

// Disparador interno — lo llaman otros servicios (testCases, executions, etc.)
export const createNotification = async ({ id_user, type, title, message, related_id }) => {
    // Si el usuario no existe o hay error, no bloqueamos el flujo principal
    try {
        return await notificationsRepository.createNotification({ id_user, type, title, message, related_id });
    } catch (err) {
        console.error('[Notifications] Error al crear notificación:', err.message);
    }
};

// GET /api/notifications
export const getNotifications = async (id_user) => {
    return notificationsRepository.findNotificationsByUser(id_user);
};

// GET /api/notifications/unread
export const getUnreadNotifications = async (id_user) => {
    return notificationsRepository.findUnreadByUser(id_user);
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (id_notification, id_user) => {
    const updated = await notificationsRepository.markAsRead(id_notification, id_user);
    if (!updated) throw new Error('Notificación no encontrada o no te pertenece');
    return updated;
};

// DELETE /api/notifications/:id
export const deleteNotification = async (id_notification, id_user) => {
    const deleted = await notificationsRepository.deleteNotification(id_notification, id_user);
    if (!deleted) throw new Error('Notificación no encontrada o no te pertenece');
    return { message: 'Notificación eliminada' };
};
