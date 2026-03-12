import { Router } from "express";
import { login, register, logout } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";

export const authRoutes = Router(); 

authRoutes.post('/register', validateSchema(registerSchema), register); 
authRoutes.post('/login', validateSchema(loginSchema), login); 
authRoutes.post('/logout', authMiddleware, logout); 