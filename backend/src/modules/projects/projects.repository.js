import { pool } from "../../config/db.js";

//POST/api/projects/

//Create project 

export const createProject = async (project) => {
    const query=`
    INSERT INTO projects(id_user, name, description)
    VALUES ($1, $2, $3)
    RETURNING name, description
    `; 

    const values = [
        project.id_user,
        project.name, 
        project.description,
    ]; 

    const result = await pool.query(query, values); 

    return result.rows[0]; 
}; 

export const getProjectById = async (id_project) => {
    const query = `
    SELECT * FROM projects WHERE id_project = $1
    `;
    const result = await pool.query(query, [id_project]);
    return result.rows[0];
};

export const updateProjectStatus = async (id_project, status) => {
    const query = `
    UPDATE projects 
    SET status = $1 
    WHERE id_project = $2 
    RETURNING id_project, status
    `;
    const values = [status, id_project];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// ==========================================
// REQUIREMENTS CRUD
// ==========================================

export const createRequirement = async (requirement) => {
    const query = `
    INSERT INTO requirements (id_project, code, description, priority, status)
    VALUES ($1, $2, $3, $4, 'DRAFT')
    RETURNING *;
    `;
    const values = [
        requirement.id_project,
        requirement.code,
        requirement.description,
        requirement.priority
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findRequirementByCodeAndProject = async (code, id_project) => {
    const query = `
    SELECT * FROM requirements 
    WHERE code = $1 AND id_project = $2
    `;
    const result = await pool.query(query, [code, id_project]);
    return result.rows[0];
};

export const getRequirementsByProject = async (id_project) => {
    const query = `
    SELECT * FROM requirements 
    WHERE id_project = $1
    ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [id_project]);
    return result.rows;
};

export const getRequirementById = async (id_requirement) => {
    const query = `
    SELECT * FROM requirements 
    WHERE id_requirement = $1
    `;
    const result = await pool.query(query, [id_requirement]);
    return result.rows[0];
};

export const updateRequirement = async (id_requirement, data) => {
    const query = `
    UPDATE requirements 
    SET code = COALESCE($1, code),
        description = COALESCE($2, description),
        priority = COALESCE($3, priority),
        status = COALESCE($4, status)
    WHERE id_requirement = $5
    RETURNING *;
    `;
    const values = [
        data.code,
        data.description,
        data.priority,
        data.status,
        id_requirement
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteRequirement = async (id_requirement) => {
    const query = `
    DELETE FROM requirements 
    WHERE id_requirement = $1
    RETURNING *;
    `;
    const result = await pool.query(query, [id_requirement]);
    return result.rows[0];
};
