// modules/evidences/evidences.service.js
import * as evidencesRepository from './evidences.repository.js';
import * as executionsRepository from '../executions/executions.repository.js';

export const createEvidence = async (id_execution, data) => {
    const execution = await executionsRepository.findExecutionById(id_execution);
    if (!execution) throw new Error('Ejecución no encontrada');

    const evidence = await evidencesRepository.createEvidence(id_execution, data);
    return evidence;
};

export const getEvidencesByExecution = async (id_execution) => {
    const execution = await executionsRepository.findExecutionById(id_execution);
    if (!execution) throw new Error('Ejecución no encontrada');

    const evidences = await evidencesRepository.findEvidencesByExecution(id_execution);
    return evidences;
};

export const getEvidenceById = async (id) => {
    const evidence = await evidencesRepository.findEvidenceById(id);
    if (!evidence) throw new Error('Evidencia no encontrada');
    return evidence;
};

export const updateEvidence = async (id, data) => {
    const evidence = await evidencesRepository.findEvidenceById(id);
    if (!evidence) throw new Error('Evidencia no encontrada');

    const updated = await evidencesRepository.updateEvidence(id, data);
    return updated;
};

export const deleteEvidence = async (id) => {
    const evidence = await evidencesRepository.findEvidenceById(id);
    if (!evidence) throw new Error('Evidencia no encontrada');

    await evidencesRepository.deleteEvidence(id);
    return { message: 'Evidencia eliminada correctamente' };
};