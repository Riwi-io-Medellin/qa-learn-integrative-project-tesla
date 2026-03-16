// modules/evidences/evidences.schemas.js
import { z } from 'zod';

export const createEvidenceSchema = z.object({
    type: z.enum(['SCREENSHOT', 'VIDEO', 'DOCUMENT']),
    file_url: z.string().url("Debe ser una URL válida"),
    description: z.string().optional()
});

export const updateEvidenceSchema = z.object({
    type: z.enum(['SCREENSHOT', 'VIDEO', 'DOCUMENT']).optional(),
    file_url: z.string().url("Debe ser una URL válida").optional(),
    description: z.string().optional()
});