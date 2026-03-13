import { pool } from "../../config/db.js";

export const getLevels = async () => {
    const result = await pool.query(
        `SELECT id_level, level_name, description FROM levels ORDER BY created_at ASC`
    );
    return result.rows;
};