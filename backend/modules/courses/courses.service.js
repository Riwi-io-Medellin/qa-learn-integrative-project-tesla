import * as coursesRepository from './courses.repository.js';

export const createCourse = async (data) => {
    const existingCourse = await coursesRepository.findCourseByTitle(data.title);
    if (existingCourse) throw new Error('Ya existe un curso con ese título');

    const course = await coursesRepository.createCourse(data);
    return course;
};

export const getAllCourses = async () => {
    const courses = await coursesRepository.findAllCourses();
    return courses;
};

export const getCourseById = async (id) => {
    const course = await coursesRepository.findCourseById(id);
    if (!course) throw new Error('Curso no encontrado');
    return course;
};

export const updateCourse = async (id, data) => {
    const course = await coursesRepository.findCourseById(id);
    if (!course) throw new Error('Curso no encontrado');

    const updated = await coursesRepository.updateCourse(id, data);
    return updated;
};

export const updateCourseStatus = async (id, status) => {
    const course = await coursesRepository.findCourseById(id);
    if (!course) throw new Error('Curso no encontrado');

    const updated = await coursesRepository.updateCourseStatus(id, status);
    return updated;
};

export const deleteCourse = async (id) => {
    const course = await coursesRepository.findCourseById(id);
    if (!course) throw new Error('Curso no encontrado');

    await coursesRepository.deleteCourse(id);
    return { message: 'Curso eliminado correctamente' };
};