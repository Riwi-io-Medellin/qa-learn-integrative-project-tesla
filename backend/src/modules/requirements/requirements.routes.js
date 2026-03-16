import { Router } from 'express';
import {
    getRequirements,
    getRequirementById,
    createRequirement,
    updateRequirement,
    updateRequirementStatus,
    deleteRequirement,
} from './requirements.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import {
    createRequirementSchema,
    updateRequirementSchema,
    updateRequirementStatusSchema,
} from './requirements.schemas.js';

export const requirementsRoutes = Router({ mergeParams: true });

requirementsRoutes.get('/',                  authMiddleware, getRequirements);
requirementsRoutes.get('/:reqId',            authMiddleware, getRequirementById);
requirementsRoutes.post('/',                 authMiddleware, validateSchema(createRequirementSchema), createRequirement);
requirementsRoutes.put('/:reqId',            authMiddleware, validateSchema(updateRequirementSchema), updateRequirement);
requirementsRoutes.patch('/:reqId/status',   authMiddleware, validateSchema(updateRequirementStatusSchema), updateRequirementStatus);
requirementsRoutes.delete('/:reqId',         authMiddleware, deleteRequirement);
