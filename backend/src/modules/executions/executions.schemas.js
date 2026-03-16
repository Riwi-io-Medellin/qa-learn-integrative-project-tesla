import { z } from 'zod';

export const createExecutionSchema = z.object({
    id_test_case: z.string().uuid("Debe ser un UUID válido"),
    result: z.enum(['PASSED', 'FAILED', 'BLOCKED']),
    observations: z.string().optional()
});

export const updateExecutionSchema = z.object({
    result: z.enum(['PASSED', 'FAILED', 'BLOCKED']).optional(),
    observations: z.string().optional()
});