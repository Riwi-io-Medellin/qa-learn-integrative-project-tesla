import { z } from 'zod';

export const createStepSchema = z.object({
    step_number: z.number().int().min(1, 'step_number must be at least 1'),
    action: z.string().min(1, 'action is required'),
    expected_result: z.string().min(1, 'expected_result is required'),
});

export const updateStepSchema = createStepSchema;

export const patchStepSchema = z.object({
    step_number: z.number().int().min(1, 'step_number must be at least 1').optional(),
    action: z.string().min(1, 'action cannot be empty').optional(),
    expected_result: z.string().min(1, 'expected_result cannot be empty').optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field must be provided');
