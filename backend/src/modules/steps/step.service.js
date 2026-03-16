import * as stepRepository from './step.repository.js';

// Error constants
const ERRORS = {
    STEP_NOT_FOUND: (id) => ({
        message: `Step with id ${id} not found.`,
        statusCode: 404
    }),
    STEP_NOT_BELONGS: (case_id) => ({
        message: `Step does not belong to test case ${case_id}.`,
        statusCode: 400
    }),
    DUPLICATE_STEP_NUMBER: (step_number, case_id) => ({
        message: `Step number ${step_number} already exists for test case ${case_id}.`,
        statusCode: 409
    })
};

// Helper to validate step exists and belongs to test case
const validateStepOwnership = async (id_step, id_test_case) => {
    const step = await stepRepository.getStepById(id_step);

    if (!step) {
        const error = new Error(ERRORS.STEP_NOT_FOUND(id_step).message);
        error.statusCode = ERRORS.STEP_NOT_FOUND(id_step).statusCode;
        throw error;
    }

    if (String(step.id_test_case) !== String(id_test_case)) {
        const error = new Error(ERRORS.STEP_NOT_BELONGS(id_test_case).message);
        error.statusCode = ERRORS.STEP_NOT_BELONGS(id_test_case).statusCode;
        throw error;
    }

    return step;
};

// Helper to check for duplicate step number
const checkDuplicateStepNumber = async (id_test_case, step_number, currentStepNumber = null) => {
    // Only check if step_number is being changed or newly created
    if (currentStepNumber === step_number) return;

    const existingStep = await stepRepository.findStepByNumberAndCase(id_test_case, step_number);
    if (existingStep) {
        const error = new Error(ERRORS.DUPLICATE_STEP_NUMBER(step_number, id_test_case).message);
        error.statusCode = ERRORS.DUPLICATE_STEP_NUMBER(step_number, id_test_case).statusCode;
        throw error;
    }
};

export const createStep = async (id_test_case, stepData) => {
    // Verify if step_number already exists for this test case
    await checkDuplicateStepNumber(id_test_case, stepData.step_number);

    // Create step
    const newStep = await stepRepository.createStep(id_test_case, stepData);
    return newStep;
};

export const getStepsByTestCase = async (id_test_case, limit = 100, offset = 0) => {
    const steps = await stepRepository.getStepsByTestCase(id_test_case, limit, offset);
    return steps;
};

export const getStepById = async (id_step) => {
    const step = await stepRepository.getStepById(id_step);
    if (!step) {
        const error = new Error(ERRORS.STEP_NOT_FOUND(id_step).message);
        error.statusCode = ERRORS.STEP_NOT_FOUND(id_step).statusCode;
        throw error;
    }
    return step;
};

export const updateStep = async (id_test_case, id_step, stepData) => {
    const step = await validateStepOwnership(id_step, id_test_case);

    // Verify if new step_number already exists for this test case (if changed)
    await checkDuplicateStepNumber(id_test_case, stepData.step_number, step.step_number);

    const updatedStep = await stepRepository.updateStep(id_step, stepData);
    return updatedStep;
};

export const patchStep = async (id_test_case, id_step, stepData) => {
    const step = await validateStepOwnership(id_step, id_test_case);

    // Verify if new step_number already exists for this test case (if changed)
    if (stepData.step_number !== undefined) {
        await checkDuplicateStepNumber(id_test_case, stepData.step_number, step.step_number);
    }

    const patchedStep = await stepRepository.patchStep(id_step, stepData);
    return patchedStep;
};

export const deleteStep = async (id_test_case, id_step) => {
    await validateStepOwnership(id_step, id_test_case);

    const deletedStep = await stepRepository.deleteStep(id_step);
    return deletedStep;
};
