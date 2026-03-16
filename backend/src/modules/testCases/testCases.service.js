import * as testCasesRepository from './testCases.repository.js';

const VALID_TYPES    = ['FUNCTIONAL', 'NON_FUNCTIONAL', 'REGRESSION'];
const VALID_STATUSES = ['DRAFT', 'ACTIVE', 'DEPRECATED'];

const assertProjectOwnership = async (id_project, id_user) => {
    const project = await testCasesRepository.findProjectByIdAndUser(id_project, id_user);
    if (!project) throw new Error('Project not found or access denied');
};

export const getTestCasesByProject = async (id_project, id_user, filters) => {
    await assertProjectOwnership(id_project, id_user);
    return testCasesRepository.findTestCasesByProject(id_project, filters);
};

export const getTestCaseById = async (id_project, id_test_case, id_user) => {
    await assertProjectOwnership(id_project, id_user);
    const testCase = await testCasesRepository.findTestCaseById(id_test_case, id_project);
    if (!testCase) throw new Error('Test case not found');
    return testCase;
};

export const createTestCase = async (id_project, id_user, fields) => {
    await assertProjectOwnership(id_project, id_user);
    if (!VALID_TYPES.includes(fields.type))
        throw new Error(`Invalid type. Valid values: ${VALID_TYPES.join(', ')}`);
    return testCasesRepository.createTestCase(id_project, fields);
};

export const updateTestCase = async (id_project, id_test_case, id_user, fields) => {
    await assertProjectOwnership(id_project, id_user);
    const testCase = await testCasesRepository.findTestCaseById(id_test_case, id_project);
    if (!testCase) throw new Error('Test case not found');
    if (!VALID_TYPES.includes(fields.type))
        throw new Error(`Invalid type. Valid values: ${VALID_TYPES.join(', ')}`);
    return testCasesRepository.updateTestCase(id_test_case, id_project, fields);
};

export const updateTestCaseStatus = async (id_project, id_test_case, id_user, status) => {
    await assertProjectOwnership(id_project, id_user);
    const testCase = await testCasesRepository.findTestCaseById(id_test_case, id_project);
    if (!testCase) throw new Error('Test case not found');
    if (!VALID_STATUSES.includes(status))
        throw new Error(`Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`);
    return testCasesRepository.updateTestCaseStatus(id_test_case, id_project, status);
};

export const deleteTestCase = async (id_project, id_test_case, id_user) => {
    await assertProjectOwnership(id_project, id_user);
    const testCase = await testCasesRepository.findTestCaseById(id_test_case, id_project);
    if (!testCase) throw new Error('Test case not found');
    await testCasesRepository.softDeleteTestCase(id_test_case, id_project);
};

// ── ADMIN: sin verificar ownership ──────────────────────────────────────
export const getAllDraftTestCases = async () => {
    return testCasesRepository.findAllDraftTestCases();
};

export const updateTestCaseStatusAdmin = async (id_test_case, status) => {
    if (!VALID_STATUSES.includes(status))
        throw new Error(`Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`);
    const updated = await testCasesRepository.updateTestCaseStatusAdmin(id_test_case, status);
    if (!updated) throw new Error('Test case not found');
    return updated;
};