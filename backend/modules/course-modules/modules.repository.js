import { pool } from '../../src/config/db.js';

export const createModule = async (id_course, data) => {
    const query = `
        INSERT INTO modules(id_course, title, content, orders)
        VALUES ($1, $2, $3, $4)
        RETURNING id_module, id_course, title, content, orders, created_at
    `;
    const values = [id_course, data.title, data.content, data.orders];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findModulesByCourse = async (id_course) => {
    const query = `
        SELECT id_module, id_course, title, content, orders, created_at
        FROM modules
        WHERE id_course = $1
        ORDER BY orders ASC
    `;
    const result = await pool.query(query, [id_course]);
    return result.rows;
};

export const findModuleById = async (id) => {
    const query = `
        SELECT id_module, id_course, title, content, orders, created_at
        FROM modules
        WHERE id_module = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const updateModule = async (id, data) => {
    const query = `
        UPDATE modules
        SET title = COALESCE($1, title),
            content = COALESCE($2, content),
            orders = COALESCE($3, orders),
            updated_at = now()
        WHERE id_module = $4
        RETURNING id_module, id_course, title, content, orders, updated_at
    `;
    const values = [data.title, data.content, data.orders, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteModule = async (id) => {
    const query = `
        DELETE FROM modules
        WHERE id_module = $1
        RETURNING id_module
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};