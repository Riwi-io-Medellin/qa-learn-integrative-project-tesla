import { pool } from "../../config/db.js";

export const createProject = async (id_user, { name, description }) => {
    const result = await pool.query(
        `INSERT INTO projects (id_user, name, description, status)
         VALUES ($1, $2, $3, 'ACTIVE')
         RETURNING id_project, name, status`,
        [id_user, name, description || null]
    );
    return result.rows[0];
};

export const updateProjectStatus = async (id_project, id_user, status) => {
    const result = await pool.query(
        `UPDATE projects
         SET status     = $1,
             updated_at = NOW()
         WHERE id_project = $2
           AND id_user    = $3
           AND deleted_at IS NULL
         RETURNING id_project, status`,
        [status, id_project, id_user]
    );
    return result.rows[0];
};

export const getProjectsByUser = async (id_user, { status, page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    let query = `SELECT id_project, name, status, created_at FROM projects WHERE id_user = $1 AND deleted_at IS NULL`;
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

export const getProjectByIdAndUser = async (id_project, id_user) => {
    const query = `
        SELECT
            p.id_project,
            p.name,
            p.description,
            p.status,
            COUNT(DISTINCT r.id_requirement)            AS total_requirements,
            COUNT(DISTINCT tc.id_test_case)             AS total_test_cases
        FROM projects p
        LEFT JOIN requirements r  ON r.id_project  = p.id_project
        LEFT JOIN test_cases tc   ON tc.id_project = p.id_project AND tc.deleted_at IS NULL
        WHERE p.id_project = $1
          AND p.id_user    = $2
          AND p.deleted_at IS NULL
        GROUP BY p.id_project
    `;
    const result = await pool.query(query, [id_project, id_user]);
    return result.rows[0];
};

export const updateProject = async (id_project, id_user, { name, description }) => {
    const result = await pool.query(
        `UPDATE projects
         SET name = $1, description = $2, updated_at = NOW()
         WHERE id_project = $3 AND id_user = $4 AND deleted_at IS NULL
         RETURNING id_project, name`,
        [name, description, id_project, id_user]
    );
    return result.rows[0];
};

export const deleteProject = async (id_project, id_user) => {
    const result = await pool.query(
        `UPDATE projects SET deleted_at = NOW()
         WHERE id_project = $1 AND id_user = $2 AND deleted_at IS NULL
         RETURNING id_project`,
        [id_project, id_user]
    );
    return result.rows[0];
};