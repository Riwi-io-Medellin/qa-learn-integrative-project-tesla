import { z } from 'zod';

export const createProjectSchema = z.object({
    name:        z.string().min(1, 'Name is required').max(200, 'Name is too long'),
    description: z.string().max(1000, 'Description is too long').optional(),
});

export const updateProjectStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED'], {
        errorMap: () => ({ message: 'Status must be ACTIVE, COMPLETED or ARCHIVED' }),
    }),
});

export const updateProjectSchema = z.object({
    name:        z.string().min(1, 'Name is required').max(200, 'Name is too long'),
    description: z.string().max(1000, 'Description is too long').optional(),
});
