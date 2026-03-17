import { pool } from '../../config/db.js';

export const findProjectByIdAndUser = async (id_project, id_user) => {
    const result = await pool.query(
        `SELECT id_project
         FROM projects
         WHERE id_project = $1
           AND id_user    = $2
           AND deleted_at IS NULL`,
        [id_project, id_user]
    );
    return result.rows[0];
};

export const findTestCasesByProject = async (id_project, filters) => {
    const conditions = ['tc.id_project = $1', 'tc.deleted_at IS NULL'];
    const values = [id_project];
    let idx = 2;

    if (filters.status) {
        conditions.push(`tc.status = $${idx++}`);
        values.push(filters.status);
    }
    if (filters.type) {
        conditions.push(`tc.type = $${idx++}`);
        values.push(filters.type);
    }
    if (filters.id_requirement) {
        conditions.push(`tc.id_requirement = $${idx++}`);
        values.push(filters.id_requirement);
    }

    const result = await pool.query(
        `SELECT tc.id_test_case, tc.title, tc.type, tc.status, tc.id_requirement
         FROM test_cases tc
         WHERE ${conditions.join(' AND ')}
         ORDER BY tc.created_at ASC`,
        values
    );
    return result.rows;
};

export const findTestCaseById = async (id_test_case, id_project) => {
    const result = await pool.query(
        `SELECT
             tc.id_test_case,
             tc.title,
             tc.type,
             tc.status,
             tc.library_status,
             tc.description,
             tc.preconditions,
             tc.id_requirement,
             COALESCE(
                 json_agg(
                     json_build_object(
                         'id_step',         ts.id_step,
                         'step_number',     ts.step_number,
                         'action',          ts.action,
                         'expected_result', ts.expected_result
                     ) ORDER BY ts.step_number
                 ) FILTER (WHERE ts.id_step IS NOT NULL),
                 '[]'
             ) AS steps
         FROM test_cases tc
         LEFT JOIN test_steps ts ON ts.id_test_case = tc.id_test_case
         WHERE tc.id_test_case = $1
           AND tc.id_project   = $2
           AND tc.deleted_at   IS NULL
         GROUP BY tc.id_test_case`,
        [id_test_case, id_project]
    );
    return result.rows[0];
};

export const createTestCase = async (id_project, fields) => {
    const result = await pool.query(
        `INSERT INTO test_cases (id_project, id_requirement, title, description, preconditions, type, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT')
         RETURNING id_test_case, title`,
        [
            id_project,
            fields.id_requirement || null,
            fields.title,
            fields.description    || null,
            fields.preconditions  || null,
            fields.type,
        ]
    );
    return result.rows[0];
};

export const updateTestCase = async (id_test_case, id_project, fields) => {
    const result = await pool.query(
        `UPDATE test_cases
         SET title         = $1,
             description   = $2,
             preconditions = $3,
             type          = $4,
             updated_at    = NOW()
         WHERE id_test_case = $5
           AND id_project   = $6
           AND deleted_at   IS NULL
         RETURNING id_test_case, title`,
        [
            fields.title,
            fields.description   || null,
            fields.preconditions || null,
            fields.type,
            id_test_case,
            id_project,
        ]
    );
    return result.rows[0];
};

export const updateTestCaseStatus = async (id_test_case, id_project, status) => {
    const result = await pool.query(
        `UPDATE test_cases
         SET status     = $1,
             updated_at = NOW()
         WHERE id_test_case = $2
           AND id_project   = $3
           AND deleted_at   IS NULL
         RETURNING id_test_case, status`,
        [status, id_test_case, id_project]
    );
    return result.rows[0];
};

export const findPendingLibraryCases = async () => {
    const result = await pool.query(
        `SELECT tc.id_test_case, tc.id_project, tc.title,
                p.name AS project_name,
                u.first_name || ' ' || u.last_name AS user_name
         FROM test_cases tc
         JOIN projects p ON p.id_project = tc.id_project
         JOIN users u    ON u.id_user    = p.id_user
         WHERE tc.library_status = 'PENDING'
           AND tc.deleted_at IS NULL
         ORDER BY tc.updated_at DESC`
    );
    return result.rows;
};

export const updateLibraryStatus = async (id_test_case, library_status) => {
    const result = await pool.query(
        `UPDATE test_cases
         SET library_status = $1,
             updated_at     = NOW()
         WHERE id_test_case = $2
           AND deleted_at   IS NULL
         RETURNING id_test_case, library_status`,
        [library_status, id_test_case]
    );
    return result.rows[0];
};

export const softDeleteTestCase = async (id_test_case, id_project) => {
    const result = await pool.query(
        `UPDATE test_cases
         SET deleted_at = NOW()
         WHERE id_test_case = $1
           AND id_project   = $2
           AND deleted_at   IS NULL
         RETURNING id_test_case`,
        [id_test_case, id_project]
    );
    return result.rows[0];
};