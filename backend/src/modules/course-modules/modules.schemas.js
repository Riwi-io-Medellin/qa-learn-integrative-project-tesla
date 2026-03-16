import { z } from 'zod';

export const createModuleSchema = z.object({
    title: z.string().min(1, "El título es requerido").max(200, "El título es muy largo"),
    content: z.string().min(1, "El contenido es requerido"),
    orders: z.number().int().positive("El orden debe ser un número positivo")
});

export const updateModuleSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    orders: z.number().int().positive().optional()
});