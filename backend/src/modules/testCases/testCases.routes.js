import { Router } from 'express';
import {
    getTestCasesByProject, getTestCaseById, createTestCase,
    updateTestCase, updateTestCaseStatus, deleteTestCase,
} from './testCases.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema }  from '../../middlewares/validate.middleware.js';
import {
    createTestCaseSchema, updateTestCaseSchema, updateTestCaseStatusSchema,
} from './testCases.schemas.js';

export const testCasesRoutes = Router({ mergeParams: true });

testCasesRoutes.get('/',                 authMiddleware, getTestCasesByProject);
testCasesRoutes.get('/:caseId',          authMiddleware, getTestCaseById);
testCasesRoutes.post('/',                authMiddleware, validateSchema(createTestCaseSchema), createTestCase);
testCasesRoutes.put('/:caseId',          authMiddleware, validateSchema(updateTestCaseSchema), updateTestCase);
testCasesRoutes.patch('/:caseId/status', authMiddleware, validateSchema(updateTestCaseStatusSchema), updateTestCaseStatus);
testCasesRoutes.delete('/:caseId',       authMiddleware, deleteTestCase);