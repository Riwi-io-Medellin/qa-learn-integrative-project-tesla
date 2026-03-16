import bcrypt from 'bcryptjs';
import * as authRepository from './auth.repository.js';
import { env } from '../../config/env.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (data) => {
    const { first_name, last_name, email, password } = data;

    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) throw new Error('Email already registered');

    const role = await authRepository.findRoleByName('STUDENT');
    if (!role) throw new Error('Role STUDENT not found');

    const hashedPassword = await bcrypt.hash(password, env.bcrypt.saltRounds);

    return authRepository.createUser({
        id_role: role.id_role,
        first_name,
        last_name,
        email,
        password: hashedPassword,
    });
};

export const loginUser = async (data) => {
    const { email, password } = data;

    const existingUser = await authRepository.findUserByEmail(email);
    if (!existingUser) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, existingUser.password_hash);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign(
        { id: existingUser.id_user, role: existingUser.role_name },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn }
    );

    const user = {
        id:    existingUser.id_user,
        name:  existingUser.first_name,
        email: existingUser.email,
        role:  existingUser.role_name,
    };

    return { user, token };
};

export const getMe = async (id) => {
    const user = await authRepository.findUserById(id);
    if (!user) throw new Error('User not found');
    return user;
};
