import { pool } from "../../config/db";

export const createStep = async (step) => {
    const query=`
    INSERT INTO steps(id_role, first_name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_user, first_name, last_name, email
    `; 

    const values = [
        user.id_role,
        user.first_name, 
        user.last_name,
        user.email,
        user.password
    ]; 

    const result = await pool.query(query, values); 

    return result.rows[0]; 
}; 