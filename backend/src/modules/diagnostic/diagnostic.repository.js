import { pool } from '../../config/db.js';

// ── Validation helpers ────────────────────────────────────────────────────

export const findLevelById = async (id_level) => {
    const result = await pool.query(
        `SELECT id_level FROM levels WHERE id_level = $1`,
        [id_level]
    );
    return result.rows[0];
};

export const findRouteById = async (id_route) => {
    const result = await pool.query(
        `SELECT id_route FROM learning_routes WHERE id_route = $1`,
        [id_route]
    );
    return result.rows[0];
};

// ── Diagnostic CRUD ───────────────────────────────────────────────────────

export const createDiagnostic = async ({ id_user, score, id_level, id_route }) => {
    const result = await pool.query(
        `INSERT INTO diagnostic (id_user, score, id_level, id_route, performed_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id_diagnostic, score, id_level, id_route, performed_at`,
        [id_user, score, id_level, id_route]
    );
    return result.rows[0];
};

export const getDiagnosticsByUser = async (id_user) => {
    const result = await pool.query(
        `SELECT d.id_diagnostic, d.score, d.performed_at,
                l.level_name, r.route_name
         FROM diagnostic d
         JOIN levels l          ON d.id_level = l.id_level
         JOIN learning_routes r ON d.id_route = r.id_route
         WHERE d.id_user = $1
         ORDER BY d.performed_at DESC`,
        [id_user]
    );
    return result.rows;
};

export const getDiagnosticById = async (id_diagnostic, id_user) => {
    const result = await pool.query(
        `SELECT id_diagnostic, score, id_level, id_route, performed_at
         FROM diagnostic
         WHERE id_diagnostic = $1 AND id_user = $2`,
        [id_diagnostic, id_user]
    );
    return result.rows[0];
};
