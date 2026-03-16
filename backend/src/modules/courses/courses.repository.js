import { pool } from '../../config/db.js';

export const createCourse = async (course) => {
    const query = `
        INSERT INTO courses(title, description, status)
        VALUES ($1, $2, $3)
        RETURNING id_course, title, description, status, created_at
    `;
    const values = [course.title, course.description, course.status];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findAllCourses = async () => {
    const query = `
        SELECT id_course, title, description, status, created_at
        FROM courses
    `;
    const result = await pool.query(query);
    return result.rows;
};

export const findCourseById = async (id) => {
    const query = `
        SELECT id_course, title, description, status, created_at
        FROM courses
        WHERE id_course = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const findCourseByTitle = async (title) => {
    const query = `SELECT id_course FROM courses WHERE title = $1`;
    const result = await pool.query(query, [title]);
    return result.rows[0];
};

export const updateCourse = async (id, data) => {
    const query = `
        UPDATE courses
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            status = COALESCE($3, status),
            updated_at = now()
        WHERE id_course = $4
        RETURNING id_course, title, description, status, updated_at
    `;
    const values = [data.title, data.description, data.status, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updateCourseStatus = async (id, status) => {
    const query = `
        UPDATE courses
        SET status = $1,
            updated_at = now()
        WHERE id_course = $2
        RETURNING id_course, status
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
};

export const deleteCourse = async (id) => {
    const query = `
        DELETE FROM courses
        WHERE id_course = $1
        RETURNING id_course
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};