import { z } from 'zod';

export const createTestCaseSchema = z.object({
    title:          z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    description:    z.string().max(2000).optional(),
    preconditions:  z.string().max(2000).optional(),
    type:           z.enum(['FUNCTIONAL', 'NON_FUNCTIONAL', 'REGRESSION'], {
        errorMap: () => ({ message: 'Type must be FUNCTIONAL, NON_FUNCTIONAL or REGRESSION' }),
    }),
    id_requirement: z.string().uuid('id_requirement must be a valid UUID').optional(),
    status:         z.string().optional(),
});

export const updateTestCaseSchema = z.object({
    title:         z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    description:   z.string().max(2000).optional(),
    preconditions: z.string().max(2000).optional(),
    type:          z.enum(['FUNCTIONAL', 'NON_FUNCTIONAL', 'REGRESSION'], {
        errorMap: () => ({ message: 'Type must be FUNCTIONAL, NON_FUNCTIONAL or REGRESSION' }),
    }),
});

export const updateTestCaseStatusSchema = z.object({
    status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED'], {
        errorMap: () => ({ message: 'Status must be DRAFT, ACTIVE or DEPRECATED' }),
    }),
});

export const approveLibrarySchema = z.object({
    category: z.string().min(1, 'La categoría es requerida').max(100),
    tags:     z.array(z.string()).optional(),
});
