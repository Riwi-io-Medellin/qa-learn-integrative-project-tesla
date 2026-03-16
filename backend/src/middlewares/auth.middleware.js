import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const authMiddleware = (req, res, next) => {
    // 1. Obtener el token del header (formato: "Bearer <token>")
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar el token
    try {
        const decoded = jwt.verify(token, env.jwt.secret);
        
        // 3. Adjuntar el payload del usuario decodificado a la request
        req.user = decoded;
        
        // 4. Continuar al siguiente middleware/controlador
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ error: "Token expired." });
        }
        return res.status(403).json({ error: "Invalid token." });
    }
};