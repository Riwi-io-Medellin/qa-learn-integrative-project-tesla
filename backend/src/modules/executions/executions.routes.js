// modules/executions/executions.routes.js
import { Router } from 'express';
import { createExecution, getAllExecutions, getExecutionById, getExecutionsByTestCase, updateExecution, deleteExecution } from './executions.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { createExecutionSchema, updateExecutionSchema } from './executions.schemas.js';

export const executionsRoutes = Router();

executionsRoutes.post('/', authMiddleware, validateSchema(createExecutionSchema), createExecution);
executionsRoutes.get('/', authMiddleware, getAllExecutions);
executionsRoutes.get('/:id', authMiddleware, getExecutionById);
executionsRoutes.get('/test-case/:id_test_case', authMiddleware, getExecutionsByTestCase);
executionsRoutes.put('/:id', authMiddleware, validateSchema(updateExecutionSchema), updateExecution);
executionsRoutes.delete('/:id', authMiddleware, deleteExecution);