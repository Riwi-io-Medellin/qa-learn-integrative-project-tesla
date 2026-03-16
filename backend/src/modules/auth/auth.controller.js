import * as authService from './auth.service.js';
import catchAsync from '../../middlewares/catchAsync.js';

export const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const user = await authService.loginUser(req.body);
        res.status(200).json({ message: 'Ingreso correctamente', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.status(200).json({ message: 'Cierre de sesión exitoso. Por favor elimine el token del cliente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al cerrar sesión' });
    }
};

export const me = catchAsync(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ user });
});
