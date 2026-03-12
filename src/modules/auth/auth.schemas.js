import { z } from 'zod';

export const registerSchema = z.object({
    first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre es muy largo"),
    last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50, "El apellido es muy largo"),
    email: z.string().email("Debe ser un correo electrónico válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100, "La contraseña es muy larga")
});

export const loginSchema = z.object({
    email: z.string().email("Debe ser un correo electrónico válido"),
    password: z.string().min(1, "La contraseña es requerida")
});
