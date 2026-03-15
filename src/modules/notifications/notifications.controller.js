import * as notificationsService from './notifications.service.js';

// GET /api/notifications
export const getNotifications = async (req, res) => {
    try {
        const notifications = await notificationsService.getNotifications(req.user.id);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// GET /api/notifications/unread
export const getUnreadNotifications = async (req, res) => {
    try {
        const notifications = await notificationsService.getUnreadNotifications(req.user.id);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req, res) => {
    try {
        const updated = await notificationsService.markAsRead(req.params.id, req.user.id);
        res.status(200).json(updated);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
    try {
        const result = await notificationsService.deleteNotification(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
