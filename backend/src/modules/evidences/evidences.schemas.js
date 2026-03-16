// modules/evidences/evidences.schemas.js
import { z } from 'zod';

export const createEvidenceSchema = z.object({
    type: z.enum(['SCREENSHOT', 'VIDEO', 'DOCUMENT']),
    description: z.string().optional()
});

export const updateEvidenceSchema = z.object({
    type: z.enum(['SCREENSHOT', 'VIDEO', 'DOCUMENT']).optional(),
    description: z.string().optional()
});