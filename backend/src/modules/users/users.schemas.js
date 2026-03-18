// modules/users/users.schemas.js
import { z } from 'zod';

export const updateUserStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'INACTIVE'])
});