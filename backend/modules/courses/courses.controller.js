// modules/courses/courses.controller.js
import * as coursesService from './courses.service.js';

export const createCourse = async (req, res) => {
    try {
        const course = await coursesService.createCourse(req.body);
        res.status(201).json({
            message: 'Curso creado correctamente',
            course
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        const courses = await coursesService.getAllCourses();
        res.status(200).json({ courses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await coursesService.getCourseById(req.params.id);
        res.status(200).json({ course });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await coursesService.updateCourse(req.params.id, req.body);
        res.status(200).json({
            message: 'Curso actualizado correctamente',
            course
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const result = await coursesService.deleteCourse(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

