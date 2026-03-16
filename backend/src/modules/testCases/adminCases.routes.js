import { Router } from 'express';
import { getAllDraftTestCases, updateTestCaseStatusAdmin } from './testCases.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole }    from '../../middlewares/role.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { updateTestCaseStatusSchema } from './testCases.schemas.js';

export const adminCasesRoutes = Router();

adminCasesRoutes.get(
    '/test-cases',
    authMiddleware, requireRole('ADMIN'),
    getAllDraftTestCases
);

adminCasesRoutes.patch(
    '/test-cases/:caseId/status',
    authMiddleware, requireRole('ADMIN'),
    validateSchema(updateTestCaseStatusSchema),
    updateTestCaseStatusAdmin
);