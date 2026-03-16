import { pool } from '../../config/db.js';

export const createLibraryTest = async (data) => {
    const result = await pool.query(
        `INSERT INTO library_tests(id_test_case, id_admin, category, tags)
         VALUES ($1, $2, $3, $4)
         RETURNING id_library, id_test_case, id_admin, category, tags, validated_at`,
        [data.id_test_case, data.id_admin, data.category, data.tags]
    );
    return result.rows[0];
};

export const findAllLibraryTests = async ({ category } = {}) => {
    let query = `
        SELECT lt.id_library, lt.category, lt.tags, lt.validated_at,
               tc.title, tc.type, tc.description, tc.preconditions
        FROM library_tests lt
        JOIN test_cases tc ON lt.id_test_case = tc.id_test_case
    `;
    const values = [];
    if (category) { values.push(category); query += ` WHERE lt.category = $1`; }
    query += ` ORDER BY lt.validated_at DESC`;
    const result = await pool.query(query, values);
    return result.rows;
};

export const findLibraryTestById = async (id) => {
    const result = await pool.query(
        `SELECT lt.id_library, lt.category, lt.tags, lt.validated_at,
                tc.title, tc.type, tc.description, tc.preconditions
         FROM library_tests lt
         JOIN test_cases tc ON lt.id_test_case = tc.id_test_case
         WHERE lt.id_library = $1`,
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
         SET category = COALESCE($1, category), tags = COALESCE($2, tags), updated_at = now()
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