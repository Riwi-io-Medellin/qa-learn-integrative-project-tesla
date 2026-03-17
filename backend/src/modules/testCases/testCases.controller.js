import * as testCasesService from './testCases.service.js';

export const getTestCasesByProject = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user = req.user.id;
        const { status, type, id_requirement } = req.query;

        const testCases = await testCasesService.getTestCasesByProject(id, id_user, {
            status,
            type,
            id_requirement,
        });
        res.status(200).json(testCases);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const getTestCaseById = async (req, res) => {
    try {
        const { id, caseId } = req.params;
        const id_user = req.user.id;

        const testCase = await testCasesService.getTestCaseById(id, caseId, id_user);
        res.status(200).json(testCase);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const createTestCase = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user = req.user.id;

        const testCase = await testCasesService.createTestCase(id, id_user, req.body);
        res.status(201).json(testCase);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateTestCase = async (req, res) => {
    try {
        const { id, caseId } = req.params;
        const id_user = req.user.id;

        const updated = await testCasesService.updateTestCase(id, caseId, id_user, req.body);
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateTestCaseStatus = async (req, res) => {
    try {
        const { id, caseId } = req.params;
        const id_user = req.user.id;
        const { status } = req.body;

        const updated = await testCasesService.updateTestCaseStatus(id, caseId, id_user, status);
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getPendingLibrary = async (req, res) => {
    try {
        const cases = await testCasesService.getPendingLibrary();
        res.status(200).json({ cases });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const rejectLibrary = async (req, res) => {
    try {
        const { id, caseId } = req.params;
        await testCasesService.rejectLibrary(id, caseId);
        res.status(200).json({ message: 'Solicitud rechazada.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const requestLibrary = async (req, res) => {
    try {
        const { id, caseId } = req.params;
        const id_user = req.user.id;
        const result = await testCasesService.requestLibrary(id, caseId, id_user);
        res.status(200).json({ message: 'Solicitud enviada. Pendiente de aprobación.', result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const approveLibrary = async (req, res) => {
    try {
        const { id, caseId } = req.params;
        const id_admin = req.user.id;
        const { category, tags } = req.body;
        const result = await testCasesService.approveLibrary(id, caseId, id_admin, { category, tags });
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteTestCase = async (req, res) => {
    try {
        const { id, caseId } = req.params;
        const id_user = req.user.id;

        await testCasesService.deleteTestCase(id, caseId, id_user);
        res.status(200).json({ message: 'Test case deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};