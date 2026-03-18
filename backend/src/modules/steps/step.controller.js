import * as stepService from './step.service.js';
import catchAsync from '../../middlewares/catchAsync.js'; // ← default import, sin llaves

export const createStep = catchAsync(async (req, res) => {
    const { id, case_id } = req.params;
    const id_user = req.user.id;

    const step = await stepService.createStep(id, case_id, id_user, req.body);
    res.status(201).json(step);
});

export const getSteps = catchAsync(async (req, res) => {
    const { id, case_id } = req.params;
    const id_user = req.user.id;
    const limit  = parseInt(req.query.limit)  || 100;
    const offset = parseInt(req.query.offset) || 0;

    const steps = await stepService.getStepsByTestCase(id, case_id, id_user, limit, offset);
    res.status(200).json(steps);
});

export const getStepById = catchAsync(async (req, res) => {
    const { id, case_id, step_id } = req.params;
    const id_user = req.user.id;

    const step = await stepService.getStepById(id, case_id, step_id, id_user);
    res.status(200).json(step);
});

export const updateStep = catchAsync(async (req, res) => {
    const { id, case_id, step_id } = req.params;
    const id_user = req.user.id;

    const updated = await stepService.updateStep(id, case_id, step_id, id_user, req.body);
    res.status(200).json(updated);
});

export const patchStep = catchAsync(async (req, res) => {
    const { id, case_id, step_id } = req.params;
    const id_user = req.user.id;

    const patched = await stepService.patchStep(id, case_id, step_id, id_user, req.body);
    res.status(200).json(patched);
});

export const deleteStep = catchAsync(async (req, res) => {
    const { id, case_id, step_id } = req.params;
    const id_user = req.user.id;

    const deleted = await stepService.deleteStep(id, case_id, step_id, id_user);
    res.status(200).json({ message: 'Step deleted successfully', id_step: deleted.id_step });
});
