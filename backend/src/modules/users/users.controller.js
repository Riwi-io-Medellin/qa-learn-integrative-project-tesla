import * as usersService from './users.service.js';
import catchAsync from '../../middlewares/catchAsync.js';

export const getAllUsers = catchAsync(async (req, res) => {
    const users = await usersService.getAllUsers(req.query);
    res.status(200).json({ users });
});

export const getUserById = catchAsync(async (req, res) => {
    const user = await usersService.getUserById(req.params.id);
    res.status(200).json({ user });
});

export const updateUserStatus = catchAsync(async (req, res) => {
    const user = await usersService.updateUserStatus(req.params.id, req.body.status);
    res.status(200).json({ message: 'Status actualizado correctamente', user });
});

export const deleteUser = catchAsync(async (req, res) => {
    const result = await usersService.deleteUser(req.params.id);
    res.status(200).json(result);
});