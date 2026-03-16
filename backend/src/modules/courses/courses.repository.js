import { pool } from '../../config/db.js';

export const createCourse = async (course) => {
    const result = await pool.query(
        `INSERT INTO courses (title, description, status)
         VALUES ($1, $2, $3)
         RETURNING id_course, title, description, status, created_at`,
        [course.title, course.description, course.status]
    );
    return result.rows[0];
};

export const findAllCourses = async () => {
    const result = await pool.query(
        `SELECT id_course, title, description, status, created_at
         FROM courses
         ORDER BY created_at DESC`
    );
    return result.rows;
};

export const findCourseById = async (id) => {
    const result = await pool.query(
        `SELECT id_course, title, description, status, created_at
         FROM courses
         WHERE id_course = $1`,
        [id]
    );
    return result.rows[0];
};

export const findCourseByTitle = async (title) => {
    const result = await pool.query(
        `SELECT id_course FROM courses WHERE title = $1`,
        [title]
    );
    return result.rows[0];
};

export const updateCourse = async (id, data) => {
    const result = await pool.query(
        `UPDATE courses
         SET title       = COALESCE($1, title),
             description = COALESCE($2, description),
             status      = COALESCE($3, status),
             updated_at  = now()
         WHERE id_course = $4
         RETURNING id_course, title, description, status, updated_at`,
        [data.title, data.description, data.status, id]
    );
    return result.rows[0];
};

export const updateCourseStatus = async (id, status) => {
    const result = await pool.query(
        `UPDATE courses
         SET status = $1, updated_at = now()
         WHERE id_course = $2
         RETURNING id_course, status`,
        [status, id]
    );
    return result.rows[0];
};

export const deleteCourse = async (id) => {
    const result = await pool.query(
        `DELETE FROM courses
         WHERE id_course = $1
         RETURNING id_course`,
        [id]
    );
    return result.rows[0];
};
