import { pool } from '../../config/db.js';

export const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT u.id_user, u.first_name, u.last_name, u.email, r.role_name, u.status
         FROM users u
         LEFT JOIN roles r ON u.id_role = r.id_role
         WHERE u.id_user = $1 AND u.deleted_at IS NULL`,
        [id]
    );
    return result.rows[0];
};

export const findRoleByName = async (roleName) => {
    const result = await pool.query(
        `SELECT id_role FROM roles WHERE role_name = $1`, [roleName]
    );
    return result.rows[0];
};

export const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT u.id_user, u.first_name, u.last_name, u.email, u.password_hash, r.role_name
         FROM users u
         LEFT JOIN roles r ON u.id_role = r.id_role
         WHERE u.email = $1`,
        [email]
    );
    return result.rows[0];
};

export const createUser = async (user) => {
    const result = await pool.query(
        `INSERT INTO users (id_role, first_name, last_name, email, password_hash)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id_user, first_name, last_name, email`,
        [user.id_role, user.first_name, user.last_name, user.email, user.password]
    );
    return result.rows[0];
};
