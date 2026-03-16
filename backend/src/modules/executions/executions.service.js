// modules/executions/executions.service.js
import * as executionsRepository from './executions.repository.js';

export const createExecution = async (data, id_user) => {
    const execution = await executionsRepository.createExecution({
        ...data,
        id_user
    });
    return execution;
};

export const getAllExecutions = async () => {
    const executions = await executionsRepository.findAllExecutions();
    return executions;
};

export const getExecutionById = async (id) => {
    const execution = await executionsRepository.findExecutionById(id);
    if (!execution) throw new Error('Ejecución no encontrada');
    return execution;
};

export const getExecutionsByTestCase = async (id_test_case) => {
    const executions = await executionsRepository.findExecutionsByTestCase(id_test_case);
    return executions;
};

export const updateExecution = async (id, data) => {
    const execution = await executionsRepository.findExecutionById(id);
    if (!execution) throw new Error('Ejecución no encontrada');

    const updated = await executionsRepository.updateExecution(id, data);
    return updated;
};

export const deleteExecution = async (id) => {
    const execution = await executionsRepository.findExecutionById(id);
    if (!execution) throw new Error('Ejecución no encontrada');

    await executionsRepository.deleteExecution(id);
    return { message: 'Ejecución eliminada correctamente' };
};