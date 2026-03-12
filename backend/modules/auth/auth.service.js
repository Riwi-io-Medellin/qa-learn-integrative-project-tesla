import bcrypt from 'bcryptjs'; 
import * as authRepository from "./auth.repository.js"; 
import { env } from '../../src/config/env.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (data) => {
    const { first_name, last_name, email, password } = data; 


    // Existing email?
    const existingUser = await authRepository.findUserByEmail(email); 

    if (existingUser) {
        throw new Error("Email already registered"); 
    }


    //Obtain rol student 
    const role = await authRepository.findRoleByName('STUDENT')
    if (!role) throw new Error('Rol STUDENT not found');

    //Encrypt password 
    const hashedPassword = await bcrypt.hash(password, env.bcrypt.saltRounds); 

    //Create user 
    const user = await authRepository.createUser({
        id_role: role.id_role,
        first_name,
        last_name,
        email,
        password: hashedPassword
    }); 

    return user; 
}; 

export const loginUser = async (data) => {
    const {email, password} = data; 

    const existingUser = await authRepository.findUserByEmail(email);
    
    if(!existingUser){
        throw new Error("Invalid credentials");
    }
    
    const isMatch = await bcrypt.compare(password, existingUser.password_hash);

    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        {
            id: existingUser.id_user,
            role: existingUser.role_id
        },
        env.jwt.secret,
        {
            expiresIn: env.jwt.expiresIn
        }
    ); 

    const user = {
        id: existingUser.id_user,
        name: existingUser.first_name, 
        email: existingUser.email, 
        role_id: existingUser.role_id
    }

    return { user, token};
};