// modules/learning-routes/routes.schemas.js
import { z } from 'zod';

export const createRouteSchema = z.object({
    route_name: z.string().min(1, "El nombre es requerido").max(150, "El nombre es muy largo"),
    id_level: z.string().uuid("Debe ser un UUID válido"),
    description: z.string().optional()
});

export const updateRouteSchema = z.object({
    route_name: z.string().min(1).max(150).optional(),
    description: z.string().optional()
});

export const addCourseToRouteSchema = z.object({
    id_course: z.string().uuid("Debe ser un UUID válido"),
    orders: z.number().int().positive("El orden debe ser un número positivo")
});