import { Router } from 'express';
import { createStep, getSteps, getStepById, updateStep, patchStep, deleteStep } from './step.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { createStepSchema, updateStepSchema, patchStepSchema } from './step.schemas.js';

export const stepsRoutes = Router({ mergeParams: true });

// POST /api/test-cases/:case_id/steps
stepsRoutes.post('/', authMiddleware, validateSchema(createStepSchema), createStep);

// GET /api/test-cases/:case_id/steps
stepsRoutes.get('/', authMiddleware, getSteps);

// GET /api/test-cases/:case_id/steps/:step_id
stepsRoutes.get('/:step_id', authMiddleware, getStepById);

// PUT /api/test-cases/:case_id/steps/:step_id
stepsRoutes.put('/:step_id', authMiddleware, validateSchema(updateStepSchema), updateStep);

// PATCH /api/test-cases/:case_id/steps/:step_id
stepsRoutes.patch('/:step_id', authMiddleware, validateSchema(patchStepSchema), patchStep);

// DELETE /api/test-cases/:case_id/steps/:step_id
stepsRoutes.delete('/:step_id', authMiddleware, deleteStep);
