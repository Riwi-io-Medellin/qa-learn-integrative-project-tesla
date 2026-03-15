import { pool } from '../../config/db.js';

export const findStepByNumberAndCase = async (id_test_case, step_number) => {
    const query = `
        SELECT id_step
        FROM test_steps
        WHERE id_test_case = $1 AND step_number = $2
    `;
    const result = await pool.query(query, [id_test_case, step_number]);
    return result.rows[0];
};

export const createStep = async (id_test_case, stepData) => {
    const query = `
        INSERT INTO test_steps (id_test_case, step_number, action, expected_result)
        VALUES ($1, $2, $3, $4)
        RETURNING id_step, step_number
    `;
    const values = [
        id_test_case,
        stepData.step_number,
        stepData.action,
        stepData.expected_result
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getStepsByTestCase = async (id_test_case, limit = 100, offset = 0) => {
    const query = `
        SELECT id_step, step_number, action, expected_result
        FROM test_steps
        WHERE id_test_case = $1
        ORDER BY step_number ASC
        LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [id_test_case, limit, offset]);
    return result.rows;
};

export const getStepById = async (id_step) => {
    const query = `
        SELECT id_step, id_test_case, step_number, action, expected_result
        FROM test_steps
        WHERE id_step = $1
    `;
    const result = await pool.query(query, [id_step]);
    return result.rows[0];
};

export const updateStep = async (id_step, stepData) => {
    const query = `
        UPDATE test_steps
        SET step_number = $1, action = $2, expected_result = $3
        WHERE id_step = $4
        RETURNING id_step, step_number, action, expected_result
    `;
    const values = [
        stepData.step_number,
        stepData.action,
        stepData.expected_result,
        id_step
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const patchStep = async (id_step, stepData) => {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (stepData.step_number !== undefined) {
        updates.push(`step_number = $${paramCount++}`);
        values.push(stepData.step_number);
    }
    if (stepData.action !== undefined) {
        updates.push(`action = $${paramCount++}`);
        values.push(stepData.action);
    }
    if (stepData.expected_result !== undefined) {
        updates.push(`expected_result = $${paramCount++}`);
        values.push(stepData.expected_result);
    }

    if (updates.length === 0) return null;

    values.push(id_step);
    const query = `
        UPDATE test_steps
        SET ${updates.join(', ')}
        WHERE id_step = $${paramCount}
        RETURNING id_step, step_number, action, expected_result
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteStep = async (id_step) => {
    const query = `
        DELETE FROM test_steps
        WHERE id_step = $1
        RETURNING id_step
    `;
    const result = await pool.query(query, [id_step]);
    return result.rows[0];
};