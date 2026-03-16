import { z } from 'zod';

export const createCourseSchema = z.object({
    title: z.string().min(1, "El título es requerido").max(200, "El título es muy largo"),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')
});

export const updateCourseSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});