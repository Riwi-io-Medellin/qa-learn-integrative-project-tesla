import { Router } from 'express';
import {
    getTestCasesByProject,
    getTestCaseById,
    createTestCase,
    updateTestCase,
    updateTestCaseStatus,
    deleteTestCase,
    requestLibrary,
    approveLibrary,
    rejectLibrary,
    getPendingLibrary,
} from './testCases.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import {
    createTestCaseSchema,
    updateTestCaseSchema,
    updateTestCaseStatusSchema,
    approveLibrarySchema,
} from './testCases.schemas.js';

export const testCasesRoutes = Router({ mergeParams: true });

testCasesRoutes.get('/',                          authMiddleware, getTestCasesByProject);
testCasesRoutes.get('/:caseId',                   authMiddleware, getTestCaseById);
testCasesRoutes.post('/',                         authMiddleware, validateSchema(createTestCaseSchema), createTestCase);
testCasesRoutes.put('/:caseId',                   authMiddleware, validateSchema(updateTestCaseSchema), updateTestCase);
testCasesRoutes.patch('/:caseId/status',          authMiddleware, validateSchema(updateTestCaseStatusSchema), updateTestCaseStatus);
testCasesRoutes.patch('/:caseId/library-request', authMiddleware, requestLibrary);
testCasesRoutes.patch('/:caseId/library-approve', authMiddleware, requireRole('ADMIN'), validateSchema(approveLibrarySchema), approveLibrary);
testCasesRoutes.patch('/:caseId/library-reject',  authMiddleware, requireRole('ADMIN'), rejectLibrary);
testCasesRoutes.delete('/:caseId',                authMiddleware, deleteTestCase);

// Ruta global para pendientes (sin id de proyecto)
export const testCasesPendingRoute = Router();
testCasesPendingRoute.get('/pending-library', authMiddleware, requireRole('ADMIN'), getPendingLibrary);