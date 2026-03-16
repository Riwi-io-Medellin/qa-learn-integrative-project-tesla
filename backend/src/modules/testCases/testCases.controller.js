import * as testCasesService from './testCases.service.js';

const httpStatus = (message) => {
    if (message.includes('access denied')) return 403;
    if (message.includes('not found'))    return 404;
    return 400;
};

export const getTestCasesByProject = async (req, res) => {
    try {
        const { status, type, id_requirement } = req.query;
        const testCases = await testCasesService.getTestCasesByProject(
            req.params.id, req.user.id, { status, type, id_requirement }
        );
        res.status(200).json(testCases);
    } catch (error) { res.status(httpStatus(error.message)).json({ error: error.message }); }
};

export const getTestCaseById = async (req, res) => {
    try {
        const testCase = await testCasesService.getTestCaseById(
            req.params.id, req.params.caseId, req.user.id
        );
        res.status(200).json(testCase);
    } catch (error) { res.status(httpStatus(error.message)).json({ error: error.message }); }
};

export const createTestCase = async (req, res) => {
    try {
        const testCase = await testCasesService.createTestCase(
            req.params.id, req.user.id, req.body
        );
        res.status(201).json(testCase);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const updateTestCase = async (req, res) => {
    try {
        const updated = await testCasesService.updateTestCase(
            req.params.id, req.params.caseId, req.user.id, req.body
        );
        res.status(200).json(updated);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const updateTestCaseStatus = async (req, res) => {
    try {
        const updated = await testCasesService.updateTestCaseStatus(
            req.params.id, req.params.caseId, req.user.id, req.body.status
        );
        res.status(200).json(updated);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const deleteTestCase = async (req, res) => {
    try {
        await testCasesService.deleteTestCase(
            req.params.id, req.params.caseId, req.user.id
        );
        res.status(200).json({ message: 'Test case deleted successfully' });
    } catch (error) { res.status(400).json({ error: error.message }); }
};

// ── ADMIN ────────────────────────────────────────────────────────────────
export const getAllDraftTestCases = async (req, res) => {
    try {
        const cases = await testCasesService.getAllDraftTestCases();
        res.status(200).json(cases);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const updateTestCaseStatusAdmin = async (req, res) => {
    try {
        const updated = await testCasesService.updateTestCaseStatusAdmin(
            req.params.caseId, req.body.status
        );
        res.status(200).json(updated);
    } catch (error) { res.status(400).json({ error: error.message }); }
};