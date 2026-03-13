import * as authService from './auth.service.js'; 

export const register = async (req, res) => {
    try{
        const user = await authService.registerUser(req.body);

        res.status(201).json({
            message: "user registered seccessfully", 
            user
        }); 
    }catch(error){
        res.status(400).json({
            error: error.message
        }); 
    }
}; 

export const login = async (req, res) => {
    try{
        const user = await authService.loginUser(req.body); 

        res.status(200).json({
            message: "Ingreso correctamente",
            user
        });
    }catch(error){
        res.status(400).json({
            error: error.message
        }); 
    }
}

export const logout = async (req, res) => {
    try {
        // Since we are using stateless JWT, "logout" on the backend usually just sends a success response
        // The actual JWT token should be deleted or removed from memory/localStorage on the frontend.
        // Optionally, you can implement a token blacklist here in the DB or Redis.
        
        res.status(200).json({
            message: "Cierre de sesión exitoso. Por favor elimine el token del cliente."
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al cerrar sesión"
        });
    }
};

import catchAsync from '../../middlewares/catchAsync.js';

export const me = catchAsync(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ user });
});