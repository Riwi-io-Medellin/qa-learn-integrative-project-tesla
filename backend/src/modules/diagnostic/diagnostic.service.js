import * as diagnosticRepository from "./diagnostic.repository.js";
import { pool } from "../../config/db.js";

export const createDiagnostic = async ({ id_user, score, id_level, id_route }) => {
    // Verificar que el nivel existe
    const level = await pool.query(`SELECT id_level FROM levels WHERE id_level = $1`, [id_level]);
    if (!level.rows[0]) throw new Error("Nivel no encontrado");

    // Verificar que la ruta existe
    const route = await pool.query(`SELECT id_route FROM learning_routes WHERE id_route = $1`, [id_route]);
    if (!route.rows[0]) throw new Error("Ruta no encontrada");

    return await diagnosticRepository.createDiagnostic({ id_user, score, id_level, id_route });
};

export const getDiagnosticsByUser = async (id_user) => {
    return await diagnosticRepository.getDiagnosticsByUser(id_user);
};

export const getDiagnosticById = async (id_diagnostic, id_user) => {
    const diagnostic = await diagnosticRepository.getDiagnosticById(id_diagnostic, id_user);
    if (!diagnostic) throw new Error("Diagnóstico no encontrado");
    return diagnostic;
};