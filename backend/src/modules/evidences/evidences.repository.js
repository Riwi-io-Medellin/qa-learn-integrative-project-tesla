// modules/evidences/evidences.repository.js
import { pool } from '../../config/db.js';

export const createEvidence = async (id_execution, data) => {
    const query = `
        INSERT INTO evidences(id_execution, type, file_url, description)
        VALUES ($1, $2, $3, $4)
        RETURNING id_evidence, id_execution, type, file_url, description, uploaded_at
    `;
    const values = [id_execution, data.type, data.file_url, data.description];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findEvidencesByExecution = async (id_execution) => {
    const query = `
        SELECT id_evidence, id_execution, type, file_url, description, uploaded_at
        FROM evidences
        WHERE id_execution = $1
        ORDER BY uploaded_at DESC
    `;
    const result = await pool.query(query, [id_execution]);
    return result.rows;
};

export const findEvidenceById = async (id) => {
    const query = `
        SELECT id_evidence, id_execution, type, file_url, description, uploaded_at
        FROM evidences
        WHERE id_evidence = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const updateEvidence = async (id, data) => {
    const query = `
        UPDATE evidences
        SET type = COALESCE($1, type),
            file_url = COALESCE($2, file_url),
            description = COALESCE($3, description),
            updated_at = now()
        WHERE id_evidence = $4
        RETURNING id_evidence, id_execution, type, file_url, description, updated_at
    `;
    const values = [data.type, data.file_url, data.description, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteEvidence = async (id) => {
    const query = `
        DELETE FROM evidences
        WHERE id_evidence = $1
        RETURNING id_evidence
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};