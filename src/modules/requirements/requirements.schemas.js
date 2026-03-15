import { z } from 'zod';

export const createRequirementSchema = z.object({
    code:        z.string().min(1, 'Code is required').max(50, 'Code is too long'),
    description: z.string().min(1, 'Description is required'),
    priority:    z.enum(['HIGH', 'MEDIUM', 'LOW'], {
        errorMap: () => ({ message: 'Priority must be HIGH, MEDIUM or LOW' }),
    }).optional(),
});

export const updateRequirementSchema = z.object({
    code:        z.string().min(1, 'Code is required').max(50, 'Code is too long'),
    description: z.string().min(1, 'Description is required'),
    priority:    z.enum(['HIGH', 'MEDIUM', 'LOW'], {
        errorMap: () => ({ message: 'Priority must be HIGH, MEDIUM or LOW' }),
    }),
});

export const updateRequirementStatusSchema = z.object({
    status: z.enum(['DRAFT', 'APPROVED', 'DEPRECATED'], {
        errorMap: () => ({ message: 'Status must be DRAFT, APPROVED or DEPRECATED' }),
    }),
});
