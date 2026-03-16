// modules/library/library.schemas.js
import { z } from 'zod';

export const createLibrarySchema = z.object({
    id_test_case: z.string().uuid("Debe ser un UUID válido"),
    category: z.string().min(1, "La categoría es requerida").max(100, "La categoría es muy larga"),
    tags: z.array(z.string()).optional()
});

export const updateLibrarySchema = z.object({
    category: z.string().min(1).max(100).optional(),
    tags: z.array(z.string()).optional()
});