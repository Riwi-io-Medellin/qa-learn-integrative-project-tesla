import { pool } from '../../config/db.js';

export const findAllUsers = async ({ page = 1, limit = 10, status }) => {
    const offset = (page - 1) * limit;
    let query = `
        SELECT u.id_user, u.first_name, u.last_name, u.email, r.role_name, u.status
        FROM users u
        LEFT JOIN roles r ON u.id_role = r.id_role
        WHERE u.deleted_at IS NULL
    `;
    const values = [];

    if (status) {
        values.push(status);
        query += ` AND u.status = $${values.length}`;
    }

    values.push(limit, offset);
    query += ` ORDER BY u.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

    const result = await pool.query(query, values);
    return result.rows;
};

export const findUserById = async (id) => {
    const query = `
        SELECT u.id_user, u.first_name, u.last_name, u.email, r.role_name, u.status, u.created_at
        FROM users u
        LEFT JOIN roles r ON u.id_role = r.id_role
        WHERE u.id_user = $1 AND u.deleted_at IS NULL
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const updateUserStatus = async (id, status) => {
    const query = `
        UPDATE users
        SET status = $1, updated_at = now()
        WHERE id_user = $2
        RETURNING id_user, status
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
};

export const deleteUser = async (id) => {
    const query = `
        UPDATE users
        SET deleted_at = now()
        WHERE id_user = $1
        RETURNING id_user
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};