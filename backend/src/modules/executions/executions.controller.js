// modules/executions/executions.controller.js
import * as executionsService from './executions.service.js';
import catchAsync from '../../middlewares/catchAsync.js';

export const createExecution = catchAsync(async (req, res) => {
    const execution = await executionsService.createExecution(req.body, req.user.id);
    res.status(201).json({ message: 'Ejecución creada correctamente', execution });
});

export const getAllExecutions = catchAsync(async (req, res) => {
    const executions = await executionsService.getAllExecutions();
    res.status(200).json({ executions });
});

export const getExecutionById = catchAsync(async (req, res) => {
    const execution = await executionsService.getExecutionById(req.params.id);
    res.status(200).json({ execution });
});

export const getExecutionsByTestCase = catchAsync(async (req, res) => {
    const executions = await executionsService.getExecutionsByTestCase(req.params.id_test_case);
    res.status(200).json({ executions });
});

export const updateExecution = catchAsync(async (req, res) => {
    const execution = await executionsService.updateExecution(req.params.id, req.body);
    res.status(200).json({ message: 'Ejecución actualizada correctamente', execution });
});

export const deleteExecution = catchAsync(async (req, res) => {
    const result = await executionsService.deleteExecution(req.params.id);
    res.status(200).json(result);
});