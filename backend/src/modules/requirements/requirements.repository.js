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

export const findRequirementsByProject = async (id_project, filters) => {
    const conditions = ['id_project = $1'];
    const values = [id_project];
    let idx = 2;

    if (filters.status) {
        conditions.push(`status = $${idx++}`);
        values.push(filters.status);
    }
    if (filters.priority) {
        conditions.push(`priority = $${idx++}`);
        values.push(filters.priority);
    }

    const result = await pool.query(
        `SELECT id_requirement, code, description, priority, status
         FROM requirements
         WHERE ${conditions.join(' AND ')}
         ORDER BY created_at ASC`,
        values
    );
    return result.rows;
};

export const findRequirementById = async (id_requirement, id_project) => {
    const result = await pool.query(
        `SELECT id_requirement, code, description, priority, status
         FROM requirements
         WHERE id_requirement = $1
           AND id_project     = $2`,
        [id_requirement, id_project]
    );
    return result.rows[0];
};

export const findRequirementByCode = async (id_project, code, excludeId = null) => {
    const result = await pool.query(
        `SELECT id_requirement
         FROM requirements
         WHERE id_project = $1
           AND code       = $2
           AND ($3::uuid IS NULL OR id_requirement <> $3)`,
        [id_project, code, excludeId]
    );
    return result.rows[0];
};

export const createRequirement = async (id_project, fields) => {
    const result = await pool.query(
        `INSERT INTO requirements (id_project, code, description, priority, status)
         VALUES ($1, $2, $3, $4, 'DRAFT')
         RETURNING id_requirement, code`,
        [id_project, fields.code, fields.description, fields.priority || 'MEDIUM']
    );
    return result.rows[0];
};

export const updateRequirement = async (id_requirement, id_project, fields) => {
    const result = await pool.query(
        `UPDATE requirements
         SET code        = $1,
             description = $2,
             priority    = $3,
             updated_at  = NOW()
         WHERE id_requirement = $4
           AND id_project     = $5
         RETURNING id_requirement, code`,
        [fields.code, fields.description, fields.priority, id_requirement, id_project]
    );
    return result.rows[0];
};

export const updateRequirementStatus = async (id_requirement, id_project, status) => {
    const result = await pool.query(
        `UPDATE requirements
         SET status     = $1,
             updated_at = NOW()
         WHERE id_requirement = $2
           AND id_project     = $3
         RETURNING id_requirement, status`,
        [status, id_requirement, id_project]
    );
    return result.rows[0];
};

export const findTestCasesByRequirement = async (id_requirement) => {
    const result = await pool.query(
        `SELECT id_test_case
         FROM test_cases
         WHERE id_requirement = $1
           AND deleted_at     IS NULL
         LIMIT 1`,
        [id_requirement]
    );
    return result.rows[0];
};

export const deleteRequirement = async (id_requirement, id_project) => {
    await pool.query(
        `DELETE FROM requirements
         WHERE id_requirement = $1
           AND id_project     = $2`,
        [id_requirement, id_project]
    );
};
