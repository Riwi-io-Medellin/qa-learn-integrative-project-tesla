import { z } from 'zod';

export const updateProjectSchema = z.object({
    name:        z.string().min(1, 'Name is required').max(200, 'Name is too long'),
    description: z.string().max(1000, 'Description is too long').optional(),
});
