import { pool } from '../../src/config/db.js';

export const createRoute = async (data) => {
    const query = `
        INSERT INTO learning_routes(id_level, route_name, description)
        VALUES ($1, $2, $3)
        RETURNING id_route, route_name, id_level, description, created_at
    `;
    const values = [data.id_level, data.route_name, data.description];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findAllRoutes = async (id_level) => {
    let query = `
        SELECT lr.id_route, lr.route_name, l.level_name, 
               COUNT(cr.id_course) as total_courses
        FROM learning_routes lr
        LEFT JOIN levels l ON lr.id_level = l.id_level
        LEFT JOIN course_routes cr ON lr.id_route = cr.id_route
    `;
    const values = [];

    if (id_level) {
        values.push(id_level);
        query += ` WHERE lr.id_level = $1`;
    }

    query += ` GROUP BY lr.id_route, lr.route_name, l.level_name ORDER BY lr.created_at DESC`;
    const result = await pool.query(query, values);
    return result.rows;
};

export const findRouteById = async (id) => {
    const query = `
        SELECT lr.id_route, lr.route_name, l.level_name, lr.description,
               json_agg(json_build_object('id_course', c.id_course, 'title', c.title, 'orders', cr.orders) ORDER BY cr.orders) as courses
        FROM learning_routes lr
        LEFT JOIN levels l ON lr.id_level = l.id_level
        LEFT JOIN course_routes cr ON lr.id_route = cr.id_route
        LEFT JOIN courses c ON cr.id_course = c.id_course
        WHERE lr.id_route = $1
        GROUP BY lr.id_route, lr.route_name, l.level_name, lr.description
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const findRouteByName = async (route_name) => {
    const query = `SELECT id_route FROM learning_routes WHERE route_name = $1`;
    const result = await pool.query(query, [route_name]);
    return result.rows[0];
};

export const updateRoute = async (id, data) => {
    const query = `
        UPDATE learning_routes
        SET route_name = COALESCE($1, route_name),
            description = COALESCE($2, description),
            updated_at = now()
        WHERE id_route = $3
        RETURNING id_route, route_name, description
    `;
    const values = [data.route_name, data.description, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteRoute = async (id) => {
    const query = `
        DELETE FROM learning_routes WHERE id_route = $1
        RETURNING id_route
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const addCourseToRoute = async (id_route, id_course, orders) => {
    const query = `
        INSERT INTO course_routes(id_route, id_course, orders)
        VALUES ($1, $2, $3)
        RETURNING id_route, id_course, orders
    `;
    const result = await pool.query(query, [id_route, id_course, orders]);
    return result.rows[0];
};

export const findCourseInRoute = async (id_route, id_course) => {
    const query = `
        SELECT id_route FROM course_routes 
        WHERE id_route = $1 AND id_course = $2
    `;
    const result = await pool.query(query, [id_route, id_course]);
    return result.rows[0];
};

export const removeCourseFromRoute = async (id_route, id_course) => {
    const query = `
        DELETE FROM course_routes 
        WHERE id_route = $1 AND id_course = $2
        RETURNING id_route
    `;
    const result = await pool.query(query, [id_route, id_course]);
    return result.rows[0];
};