import { pool } from '../../config/db.js';

export const findAllLevels = async () => {
    const query = `
        SELECT id_level, level_name, description
        FROM levels
        ORDER BY level_name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

export const findAllRoles = async () => {
    const query = `
        SELECT id_role, role_name, description
        FROM roles
        ORDER BY role_name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};