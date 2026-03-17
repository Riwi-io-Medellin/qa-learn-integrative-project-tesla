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

    if (!VALID_TYPES.includes(fields.type)) {
        throw new Error(`Invalid type. Valid values: ${VALID_TYPES.join(', ')}`);
    }

    return testCasesRepository.createTestCase(id_project, fields);
};

export const updateTestCase = async (id_project, id_test_case, id_user, fields) => {
    await assertProjectOwnership(id_project, id_user);

    const testCase = await testCasesRepository.findTestCaseById(id_test_case, id_project);
    if (!testCase) throw new Error('Test case not found');

    if (!VALID_TYPES.includes(fields.type)) {
        throw new Error(`Invalid type. Valid values: ${VALID_TYPES.join(', ')}`);
    }

    return testCasesRepository.updateTestCase(id_test_case, id_project, fields);
};

export const updateTestCaseStatus = async (id_project, id_test_case, id_user, status) => {
    await assertProjectOwnership(id_project, id_user);

    const testCase = await testCasesRepository.findTestCaseById(id_test_case, id_project);
    if (!testCase) throw new Error('Test case not found');

    if (!VALID_STATUSES.includes(status)) {
        throw new Error(`Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`);
    }

    return testCasesRepository.updateTestCaseStatus(id_test_case, id_project, status);
};

export const getPendingLibrary = async () => {
    return testCasesRepository.findPendingLibraryCases();
};

export const rejectLibrary = async (id_project, id_test_case) => {
    const testCase = await testCasesRepository.findTestCaseById(id_test_case, id_project);
    if (!testCase) throw new Error('Test case not found');
    if (testCase.library_status !== 'PENDING') throw new Error('El caso no está pendiente');
    return testCasesRepository.updateLibraryStatus(id_test_case, null);
};

// Usuario solicita enviar su caso al repositorio → queda PENDING
export const requestLibrary = async (id_project, id_test_case, id_user) => {
    await assertProjectOwnership(id_project, id_user);
    const testCase = await testCasesRepository.findTestCaseById(id_test_case, id_project);
    if (!testCase) throw new Error('Test case not found');
    if (testCase.library_status === 'PENDING') throw new Error('Ya está pendiente de aprobación');
    if (testCase.library_status === 'APPROVED') throw new Error('Ya fue aprobado para el repositorio');
    return testCasesRepository.updateLibraryStatus(id_test_case, 'PENDING');
};

// Admin aprueba la solicitud → APPROVED y lo agrega a library_tests
export const approveLibrary = async (id_project, id_test_case, id_admin, { category, tags }) => {
    const testCase = await testCasesRepository.findTestCaseById(id_test_case, id_project);
    if (!testCase) throw new Error('Test case not found');
    if (testCase.library_status !== 'PENDING') throw new Error('El caso no está pendiente de aprobación');

    // Marcar como APPROVED en test_cases
    await testCasesRepository.updateLibraryStatus(id_test_case, 'APPROVED');

    // Insertar en library_tests
    const { pool } = await import('../../config/db.js');
    const existing = await pool.query(
        `SELECT id_library FROM library_tests WHERE id_test_case = $1`, [id_test_case]
    );
    if (!existing.rows[0]) {
        await pool.query(
            `INSERT INTO library_tests (id_test_case, id_admin, category, tags)
             VALUES ($1, $2, $3, $4)`,
            [id_test_case, id_admin, category || 'General', tags || []]
        );
    }
    return { message: 'Caso aprobado y enviado al repositorio.' };
};

export const deleteTestCase = async (id_project, id_test_case, id_user) => {
    await assertProjectOwnership(id_project, id_user);

    const testCase = await testCasesRepository.findTestCaseById(id_test_case, id_project);
    if (!testCase) throw new Error('Test case not found');

    await testCasesRepository.softDeleteTestCase(id_test_case, id_project);
};