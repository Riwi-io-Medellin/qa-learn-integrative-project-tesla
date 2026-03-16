// modules/course-modules/modules.service.js
import * as modulesRepository from './modules.repository.js';
import * as coursesRepository from '../courses/courses.repository.js';

export const createModule = async (id_course, data) => {
    const course = await coursesRepository.findCourseById(id_course);
    if (!course) throw new Error('Curso no encontrado');

    const module = await modulesRepository.createModule(id_course, data);
    return module;
};

export const getModulesByCourse = async (id_course) => {
    const course = await coursesRepository.findCourseById(id_course);
    if (!course) throw new Error('Curso no encontrado');

    const modules = await modulesRepository.findModulesByCourse(id_course);
    return modules;
};

export const getModuleById = async (id) => {
    const module = await modulesRepository.findModuleById(id);
    if (!module) throw new Error('Módulo no encontrado');
    return module;
};

export const updateModule = async (id, data) => {
    const module = await modulesRepository.findModuleById(id);
    if (!module) throw new Error('Módulo no encontrado');

    const updated = await modulesRepository.updateModule(id, data);
    return updated;
};

export const deleteModule = async (id) => {
    const module = await modulesRepository.findModuleById(id);
    if (!module) throw new Error('Módulo no encontrado');

    await modulesRepository.deleteModule(id);
    return { message: 'Módulo eliminado correctamente' };
};