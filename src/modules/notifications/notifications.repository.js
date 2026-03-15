import { pool } from '../../config/db.js';

// Crear una notificación
export const createNotification = async ({ id_user, type, title, message, related_id }) => {
    const result = await pool.query(
        `INSERT INTO notifications (id_user, type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id_notification, type, title, message, related_id, is_read, created_at`,
        [id_user, type, title, message, related_id || null]
    );
    return result.rows[0];
};

// Todas las notificaciones del usuario (leídas y no leídas)
export const findNotificationsByUser = async (id_user) => {
    const result = await pool.query(
        `SELECT id_notification, type, title, message, related_id, is_read, created_at
         FROM notifications
         WHERE id_user = $1
         ORDER BY created_at DESC`,
        [id_user]
    );
    return result.rows;
};

// Solo las no leídas
export const findUnreadByUser = async (id_user) => {
    const result = await pool.query(
        `SELECT id_notification, type, title, message, related_id, is_read, created_at
         FROM notifications
         WHERE id_user = $1 AND is_read = FALSE
         ORDER BY created_at DESC`,
        [id_user]
    );
    return result.rows;
};

// Marcar una como leída (verifica ownership)
export const markAsRead = async (id_notification, id_user) => {
    const result = await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE id_notification = $1 AND id_user = $2
         RETURNING id_notification, is_read`,
        [id_notification, id_user]
    );
    return result.rows[0];
};

// Eliminar una (verifica ownership)
export const deleteNotification = async (id_notification, id_user) => {
    const result = await pool.query(
        `DELETE FROM notifications
         WHERE id_notification = $1 AND id_user = $2
         RETURNING id_notification`,
        [id_notification, id_user]
    );
    return result.rows[0];
};
