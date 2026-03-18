import { pool } from '../../config/db.js';

// ── Validation helper ─────────────────────────────────────────────────────

export const findActiveTestCase = async (id_test_case) => {
    const result = await pool.query(
        `SELECT id_test_case FROM test_cases
         WHERE id_test_case = $1 AND deleted_at IS NULL`,
        [id_test_case]
    );
    return result.rows[0];
};

// ── Library CRUD ──────────────────────────────────────────────────────────

export const createLibraryTest = async (data) => {
    const result = await pool.query(
        `INSERT INTO library_tests (id_test_case, id_admin, category, tags)
         VALUES ($1, $2, $3, $4)
         RETURNING id_library, id_test_case, id_admin, category, tags, validated_at`,
        [data.id_test_case, data.id_admin, data.category, data.tags]
    );
    return result.rows[0];
};

export const findAllLibraryTests = async () => {
    const result = await pool.query(
        `SELECT id_library, id_test_case, id_admin, category, tags, validated_at
         FROM library_tests
         ORDER BY validated_at DESC`
    );
    return result.rows;
};

export const findLibraryTestById = async (id) => {
    const result = await pool.query(
        `SELECT id_library, id_test_case, id_admin, category, tags, validated_at
         FROM library_tests
         WHERE id_library = $1`,
        [id]
    );
    return result.rows[0];
};

export const findLibraryTestByTestCase = async (id_test_case) => {
    const result = await pool.query(
        `SELECT id_library FROM library_tests WHERE id_test_case = $1`,
        [id_test_case]
    );
    return result.rows[0];
};

export const updateLibraryTest = async (id, data) => {
    const result = await pool.query(
        `UPDATE library_tests
         SET category   = COALESCE($1, category),
             tags       = COALESCE($2, tags),
             updated_at = now()
         WHERE id_library = $3
         RETURNING id_library, id_test_case, id_admin, category, tags, updated_at`,
        [data.category, data.tags, id]
    );
    return result.rows[0];
};

export const deleteLibraryTest = async (id) => {
    const result = await pool.query(
        `DELETE FROM library_tests WHERE id_library = $1 RETURNING id_library`,
        [id]
    );
    return result.rows[0];
};
