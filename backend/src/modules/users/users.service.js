import * as usersRepository from './users.repository.js';

export const getAllUsers = async (filters) => {
    const users = await usersRepository.findAllUsers(filters);
    return users;
};

export const getUserById = async (id) => {
    const user = await usersRepository.findUserById(id);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
};

export const updateUserStatus = async (id, status) => {
    const user = await usersRepository.findUserById(id);
    if (!user) throw new Error('Usuario no encontrado');

    const updated = await usersRepository.updateUserStatus(id, status);
    return updated;
};

export const deleteUser = async (id) => {
    const user = await usersRepository.findUserById(id);
    if (!user) throw new Error('Usuario no encontrado');

    await usersRepository.deleteUser(id);
    return { message: 'Usuario eliminado correctamente' };
};