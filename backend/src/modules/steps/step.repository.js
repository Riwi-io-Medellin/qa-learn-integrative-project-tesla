import { pool } from '../../config/db.js';

// ── Ownership helper ──────────────────────────────────────────────────────

export const findTestCaseByIdAndProject = async (id_test_case, id_project) => {
    const result = await pool.query(
        `SELECT id_test_case
         FROM test_cases
         WHERE id_test_case = $1
           AND id_project   = $2
           AND deleted_at   IS NULL`,
        [id_test_case, id_project]
    );
    return result.rows[0];
};

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

// ── Steps ─────────────────────────────────────────────────────────────────

export const findStepByNumberAndCase = async (id_test_case, step_number) => {
    const result = await pool.query(
        `SELECT id_step
         FROM test_steps
         WHERE id_test_case = $1 AND step_number = $2`,
        [id_test_case, step_number]
    );
    return result.rows[0];
};

export const createStep = async (id_test_case, stepData) => {
    const result = await pool.query(
        `INSERT INTO test_steps (id_test_case, step_number, action, expected_result)
         VALUES ($1, $2, $3, $4)
         RETURNING id_step, step_number, action, expected_result`,
        [id_test_case, stepData.step_number, stepData.action, stepData.expected_result]
    );
    return result.rows[0];
};

export const getStepsByTestCase = async (id_test_case, limit = 100, offset = 0) => {
    const result = await pool.query(
        `SELECT id_step, step_number, action, expected_result
         FROM test_steps
         WHERE id_test_case = $1
         ORDER BY step_number ASC
         LIMIT $2 OFFSET $3`,
        [id_test_case, limit, offset]
    );
    return result.rows;
};

export const getStepById = async (id_step) => {
    const result = await pool.query(
        `SELECT id_step, id_test_case, step_number, action, expected_result
         FROM test_steps
         WHERE id_step = $1`,
        [id_step]
    );
    return result.rows[0];
};

export const updateStep = async (id_step, stepData) => {
    const result = await pool.query(
        `UPDATE test_steps
         SET step_number = $1, action = $2, expected_result = $3
         WHERE id_step = $4
         RETURNING id_step, step_number, action, expected_result`,
        [stepData.step_number, stepData.action, stepData.expected_result, id_step]
    );
    return result.rows[0];
};

export const patchStep = async (id_step, stepData) => {
    const updates = [];
    const values  = [];
    let   idx     = 1;

    if (stepData.step_number    !== undefined) { updates.push(`step_number = $${idx++}`);    values.push(stepData.step_number);    }
    if (stepData.action         !== undefined) { updates.push(`action = $${idx++}`);         values.push(stepData.action);         }
    if (stepData.expected_result !== undefined){ updates.push(`expected_result = $${idx++}`); values.push(stepData.expected_result); }

    if (updates.length === 0) {
        const error = new Error('No fields provided to update.');
        error.statusCode = 400;
        throw error;
    }

    values.push(id_step);
    const result = await pool.query(
        `UPDATE test_steps SET ${updates.join(', ')} WHERE id_step = $${idx}
         RETURNING id_step, step_number, action, expected_result`,
        values
    );
    return result.rows[0];
};

export const deleteStep = async (id_step) => {
    const result = await pool.query(
        `DELETE FROM test_steps WHERE id_step = $1 RETURNING id_step`,
        [id_step]
    );
    return result.rows[0];
};
