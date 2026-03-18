import * as stepRepository from './step.repository.js';

// ── Error helpers ─────────────────────────────────────────────────────────

const makeError = (message, statusCode) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
};

// ── Ownership validation: project → user → test case ─────────────────────

const assertOwnership = async (id_project, id_test_case, id_user) => {
    // 1. El proyecto pertenece al usuario autenticado
    const project = await stepRepository.findProjectByIdAndUser(id_project, id_user);
    if (!project) throw makeError('Project not found or access denied', 404);

    // 2. El test case pertenece al proyecto
    const testCase = await stepRepository.findTestCaseByIdAndProject(id_test_case, id_project);
    if (!testCase) throw makeError('Test case not found in this project', 404);
};

// ── Duplicate step number check ───────────────────────────────────────────

const checkDuplicateStepNumber = async (id_test_case, step_number, currentStepNumber = null) => {
    if (currentStepNumber === step_number) return;

    const existing = await stepRepository.findStepByNumberAndCase(id_test_case, step_number);
    if (existing) {
        throw makeError(
            `Step number ${step_number} already exists for test case ${id_test_case}.`,
            409
        );
    }
};

// ── Service methods ───────────────────────────────────────────────────────

export const createStep = async (id_project, id_test_case, id_user, stepData) => {
    await assertOwnership(id_project, id_test_case, id_user);
    await checkDuplicateStepNumber(id_test_case, stepData.step_number);
    return stepRepository.createStep(id_test_case, stepData);
};

export const getStepsByTestCase = async (id_project, id_test_case, id_user, limit, offset) => {
    await assertOwnership(id_project, id_test_case, id_user);
    return stepRepository.getStepsByTestCase(id_test_case, limit, offset);
};

export const getStepById = async (id_project, id_test_case, id_step, id_user) => {
    await assertOwnership(id_project, id_test_case, id_user);

    const step = await stepRepository.getStepById(id_step);
    if (!step) throw makeError(`Step with id ${id_step} not found.`, 404);
    if (String(step.id_test_case) !== String(id_test_case)) {
        throw makeError(`Step does not belong to test case ${id_test_case}.`, 400);
    }
    return step;
};

export const updateStep = async (id_project, id_test_case, id_step, id_user, stepData) => {
    await assertOwnership(id_project, id_test_case, id_user);

    const step = await stepRepository.getStepById(id_step);
    if (!step) throw makeError(`Step with id ${id_step} not found.`, 404);
    if (String(step.id_test_case) !== String(id_test_case)) {
        throw makeError(`Step does not belong to test case ${id_test_case}.`, 400);
    }

    await checkDuplicateStepNumber(id_test_case, stepData.step_number, step.step_number);
    return stepRepository.updateStep(id_step, stepData);
};

export const patchStep = async (id_project, id_test_case, id_step, id_user, stepData) => {
    await assertOwnership(id_project, id_test_case, id_user);

    const step = await stepRepository.getStepById(id_step);
    if (!step) throw makeError(`Step with id ${id_step} not found.`, 404);
    if (String(step.id_test_case) !== String(id_test_case)) {
        throw makeError(`Step does not belong to test case ${id_test_case}.`, 400);
    }

    if (stepData.step_number !== undefined) {
        await checkDuplicateStepNumber(id_test_case, stepData.step_number, step.step_number);
    }

    return stepRepository.patchStep(id_step, stepData);
};

export const deleteStep = async (id_project, id_test_case, id_step, id_user) => {
    await assertOwnership(id_project, id_test_case, id_user);

    const step = await stepRepository.getStepById(id_step);
    if (!step) throw makeError(`Step with id ${id_step} not found.`, 404);
    if (String(step.id_test_case) !== String(id_test_case)) {
        throw makeError(`Step does not belong to test case ${id_test_case}.`, 400);
    }

    return stepRepository.deleteStep(id_step);
};
