// modules/evidences/evidences.routes.js
import { Router } from 'express';
import { createEvidence, getEvidencesByExecution, getEvidenceById, updateEvidence, deleteEvidence } from './evidences.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateSchema } from '../../middlewares/validate.middleware.js';
import { uploadEvidence, handleUploadError } from '../../middlewares/uploads/multer.js';
import { createEvidenceSchema, updateEvidenceSchema } from './evidences.schemas.js';

export const evidencesRoutes = Router({ mergeParams: true });

evidencesRoutes.post('/', authMiddleware, uploadEvidence.single('file'), handleUploadError, validateSchema(createEvidenceSchema), createEvidence);
evidencesRoutes.get('/', authMiddleware, getEvidencesByExecution);
evidencesRoutes.get('/:id', authMiddleware, getEvidenceById);
evidencesRoutes.put('/:id', authMiddleware, validateSchema(updateEvidenceSchema), updateEvidence);
evidencesRoutes.delete('/:id', authMiddleware, deleteEvidence);