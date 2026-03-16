import * as diagnosticRepository from './diagnostic.repository.js';

export const createDiagnostic = async ({ id_user, score, id_level, id_route }) => {
    // Validaciones a través del repository — sin pool directo en el service
    const level = await diagnosticRepository.findLevelById(id_level);
    if (!level) throw new Error('Nivel no encontrado');

    const route = await diagnosticRepository.findRouteById(id_route);
    if (!route) throw new Error('Ruta no encontrada');

    return diagnosticRepository.createDiagnostic({ id_user, score, id_level, id_route });
};

export const getDiagnosticsByUser = async (id_user) => {
    return diagnosticRepository.getDiagnosticsByUser(id_user);
};

export const getDiagnosticById = async (id_diagnostic, id_user) => {
    const diagnostic = await diagnosticRepository.getDiagnosticById(id_diagnostic, id_user);
    if (!diagnostic) throw new Error('Diagnóstico no encontrado');
    return diagnostic;
};
