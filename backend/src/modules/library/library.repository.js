// modules/library/library.repository.js
import { pool } from '../../config/db.js';

export const createLibraryTest = async (data) => {
    const query = `
        INSERT INTO library_tests(id_test_case, id_admin, category, tags)
        VALUES ($1, $2, $3, $4)
        RETURNING id_library, id_test_case, id_admin, category, tags, validated_at
    `;
    const values = [data.id_test_case, data.id_admin, data.category, data.tags];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findAllLibraryTests = async () => {
    const query = `
        SELECT id_library, id_test_case, id_admin, category, tags, validated_at
        FROM library_tests
        ORDER BY validated_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

export const findLibraryTestById = async (id) => {
    const query = `
        SELECT id_library, id_test_case, id_admin, category, tags, validated_at
        FROM library_tests
        WHERE id_library = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const findLibraryTestByTestCase = async (id_test_case) => {
    const query = `
        SELECT id_library FROM library_tests
        WHERE id_test_case = $1
    `;
    const result = await pool.query(query, [id_test_case]);
    return result.rows[0];
};

export const updateLibraryTest = async (id, data) => {
    const query = `
        UPDATE library_tests
        SET category = COALESCE($1, category),
            tags = COALESCE($2, tags),
            updated_at = now()
        WHERE id_library = $3
        RETURNING id_library, id_test_case, id_admin, category, tags, updated_at
    `;
    const values = [data.category, data.tags, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteLibraryTest = async (id) => {
    const query = `
        DELETE FROM library_tests
        WHERE id_library = $1
        RETURNING id_library
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};