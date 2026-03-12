// modules/executions/executions.repository.js
import { pool } from '../../src/config/db.js';

export const createExecution = async (data) => {
    const query = `
        INSERT INTO test_executions(id_test_case, id_user, result, observations)
        VALUES ($1, $2, $3, $4)
        RETURNING id_execution, id_test_case, id_user, result, observations, executed_at
    `;
    const values = [data.id_test_case, data.id_user, data.result, data.observations];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findAllExecutions = async () => {
    const query = `
        SELECT id_execution, id_test_case, id_user, result, observations, executed_at
        FROM test_executions
        ORDER BY executed_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

export const findExecutionById = async (id) => {
    const query = `
        SELECT id_execution, id_test_case, id_user, result, observations, executed_at
        FROM test_executions
        WHERE id_execution = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const findExecutionsByTestCase = async (id_test_case) => {
    const query = `
        SELECT id_execution, id_test_case, id_user, result, observations, executed_at
        FROM test_executions
        WHERE id_test_case = $1
        ORDER BY executed_at DESC
    `;
    const result = await pool.query(query, [id_test_case]);
    return result.rows;
};

export const updateExecution = async (id, data) => {
    const query = `
        UPDATE test_executions
        SET result = COALESCE($1, result),
            observations = COALESCE($2, observations),
            updated_at = now()
        WHERE id_execution = $3
        RETURNING id_execution, id_test_case, id_user, result, observations, updated_at
    `;
    const values = [data.result, data.observations, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteExecution = async (id) => {
    const query = `
        DELETE FROM test_executions
        WHERE id_execution = $1
        RETURNING id_execution
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};