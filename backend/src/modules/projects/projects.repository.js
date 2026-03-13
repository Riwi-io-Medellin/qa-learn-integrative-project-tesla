import { pool } from "../../config/db.js";

export const getProjectsByUser = async (id_user, { status, page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    let query = `SELECT id_project, name, status, created_at FROM projects WHERE id_user = $1`;
    const values = [id_user];

    if (status) {
        values.push(status);
        query += ` AND status = $${values.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
};

export const deleteProject = async (id_project, id_user) => {
    const result = await pool.query(
        `DELETE FROM projects WHERE id_project = $1 AND id_user = $2 RETURNING id_project`,
        [id_project, id_user]
    );
    return result.rows[0];
};