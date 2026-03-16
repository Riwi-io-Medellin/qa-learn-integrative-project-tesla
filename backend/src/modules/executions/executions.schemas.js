import { z } from 'zod';

// Valores válidos deben coincidir con el CHECK constraint de la BD en test_executions.result
const VALID_RESULTS = ['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'];

export const createExecutionSchema = z.object({
    id_test_case: z.string().or(z.number()),
    result: z.enum(VALID_RESULTS, {
        errorMap: () => ({ message: `result must be one of: ${VALID_RESULTS.join(', ')}` }),
    }),
    observations: z.string().optional(),
});

export const updateExecutionSchema = z.object({
    result: z.enum(VALID_RESULTS, {
        errorMap: () => ({ message: `result must be one of: ${VALID_RESULTS.join(', ')}` }),
    }).optional(),
    observations: z.string().optional(),
});