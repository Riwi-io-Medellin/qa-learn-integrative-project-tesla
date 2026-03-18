import { pool } from '../../config/db.js';

export const getProjectReport = async (id_project, id_user) => {
    // Verificar que el proyecto pertenece al usuario
    const projResult = await pool.query(
        `SELECT id_project, name, description, status, created_at
         FROM projects
         WHERE id_project = $1 AND id_user = $2 AND deleted_at IS NULL`,
        [id_project, id_user]
    );
    if (!projResult.rows[0]) return null;
    const project = projResult.rows[0];

    // Requerimientos con sus casos y pasos
    const reqResult = await pool.query(
        `SELECT r.id_requirement, r.code, r.description, r.priority, r.status
         FROM requirements r
         WHERE r.id_project = $1 AND r.deleted_at IS NULL
         ORDER BY r.created_at ASC`,
        [id_project]
    );

    const requirements = [];
    for (const req of reqResult.rows) {
        const casesResult = await pool.query(
            `SELECT tc.id_test_case, tc.title, tc.type, tc.status,
                    (SELECT COUNT(*) FROM test_steps ts WHERE ts.id_test_case = tc.id_test_case) AS step_count,
                    (SELECT COUNT(*) FROM test_executions te WHERE te.id_test_case = tc.id_test_case) AS exec_count,
                    (SELECT te2.result FROM test_executions te2 WHERE te2.id_test_case = tc.id_test_case ORDER BY te2.executed_at DESC LIMIT 1) AS last_result
             FROM test_cases tc
             WHERE tc.id_requirement = $1 AND tc.deleted_at IS NULL
             ORDER BY tc.created_at ASC`,
            [req.id_requirement]
        );

        const cases = [];
        for (const tc of casesResult.rows) {
            const stepsResult = await pool.query(
                `SELECT id_step, step_number, action, expected_result
                 FROM test_steps WHERE id_test_case = $1 ORDER BY step_number ASC`,
                [tc.id_test_case]
            );
            cases.push({
                ...tc,
                steps: stepsResult.rows,
                executions: parseInt(tc.exec_count),
                lastResult: tc.last_result || null,
            });
        }
        requirements.push({ ...req, cases });
    }

    // Calcular estadísticas globales
    const allCases = requirements.flatMap(r => r.cases);
    const execResults = allCases.map(c => c.lastResult).filter(Boolean);
    const stats = {
        total:   execResults.length,
        passed:  execResults.filter(r => r === 'PASSED').length,
        failed:  execResults.filter(r => r === 'FAILED').length,
        blocked: execResults.filter(r => r === 'BLOCKED').length,
        pending: allCases.filter(c => !c.lastResult).length,
    };

    return {
        ...project,
        requirements,
        totalCases: allCases.length,
        stats,
    };
};
