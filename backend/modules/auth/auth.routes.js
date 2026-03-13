import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";
import { login, register, logout, me } from "./auth.controller.js";


export const authRoutes = Router(); 

authRoutes.get('/me', authMiddleware, me);
authRoutes.post('/register', validateSchema(registerSchema), register); 
authRoutes.post('/login', validateSchema(loginSchema), login); 
authRoutes.post('/logout', authMiddleware, logout); 