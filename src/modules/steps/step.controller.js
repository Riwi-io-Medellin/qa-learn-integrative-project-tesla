import * as stepService from './step.service.js';
import { catchAsync } from '../../middlewares/catchAsync.js';

export const createStep = catchAsync(async (req, res) => {
    const case_id = req.params.case_id;
    const stepData = req.body;

    const result = await stepService.createStep(case_id, stepData);
    res.status(201).json(result);
});

export const getSteps = catchAsync(async (req, res) => {
    const case_id = req.params.case_id;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const steps = await stepService.getStepsByTestCase(case_id, limit, offset);
    res.status(200).json(steps);
});

export const getStepById = catchAsync(async (req, res) => {
    const { case_id, step_id } = req.params;
    const step = await stepService.getStepById(step_id);

    // Verify the step belongs to this test case
    if (String(step.id_test_case) !== String(case_id)) {
        return res.status(400).json({ message: `Step does not belong to test case ${case_id}.` });
    }

    res.status(200).json(step);
});

export const updateStep = catchAsync(async (req, res) => {
    const { case_id, step_id } = req.params;
    const stepData = req.body;

    const updatedStep = await stepService.updateStep(case_id, step_id, stepData);
    res.status(200).json(updatedStep);
});

export const patchStep = catchAsync(async (req, res) => {
    const { case_id, step_id } = req.params;
    const stepData = req.body;

    const patchedStep = await stepService.patchStep(case_id, step_id, stepData);
    res.status(200).json(patchedStep);
});

export const deleteStep = catchAsync(async (req, res) => {
    const { case_id, step_id } = req.params;

    const deletedStep = await stepService.deleteStep(case_id, step_id);
    res.status(200).json({ message: 'Step deleted successfully', id_step: deletedStep.id_step });
});
