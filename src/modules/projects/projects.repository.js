import { pool } from '../../config/db.js';

export const findProjectByIdAndUser = async (id_project, id_user) => {
    const query = `
        SELECT
            p.id_project,
            p.name,
            p.description,
            p.status,
            COUNT(DISTINCT r.id_requirement)  AS total_requirements,
            COUNT(DISTINCT tc.id_test_case)   AS total_test_cases
        FROM projects p
        LEFT JOIN requirements r
            ON r.id_project = p.id_project
        LEFT JOIN test_cases tc
            ON tc.id_project = p.id_project
            AND tc.deleted_at IS NULL
        WHERE p.id_project = $1
          AND p.id_user     = $2
          AND p.deleted_at  IS NULL
        GROUP BY p.id_project
    `;
    const result = await pool.query(query, [id_project, id_user]);
    return result.rows[0];
};

export const updateProject = async (id_project, id_user, fields) => {
    const query = `
        UPDATE projects
        SET
            name        = $1,
            description = $2,
            updated_at  = NOW()
        WHERE id_project = $3
          AND id_user     = $4
          AND deleted_at  IS NULL
        RETURNING id_project, name
    `;
    const result = await pool.query(query, [
        fields.name,
        fields.description,
        id_project,
        id_user,
    ]);
    return result.rows[0];
};
