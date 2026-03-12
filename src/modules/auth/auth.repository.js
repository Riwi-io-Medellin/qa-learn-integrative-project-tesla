import { pool } from "../../config/db.js";

//POST/api/auth/register 

//Find role by name 

export const findRoleByName = async (roleName) => {
    const result = await pool.query(
        `SELECT id_role FROM roles WHERE role_name = $1`, [roleName]
    )
    return result.rows[0]
}; 


//Register 

export const findUserByEmail = async (email) => {
    const query = `
    SELECT id_user, first_name, last_name, email, password_hash
    FROM users
    WHERE email =$1
    `; 

    const result = await pool.query(query, [email]); 
    return result.rows[0]; 
}; 

export const createUser = async (user) => {
    const query=`
    INSERT INTO users(id_role, first_name, last_name, email, password_hash)
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