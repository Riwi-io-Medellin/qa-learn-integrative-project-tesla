// modules/course-modules/modules.controller.js
import * as modulesService from './modules.service.js';
import catchAsync from '../../middlewares/catchAsync.js';

export const createModule = catchAsync(async (req, res) => {
    const module = await modulesService.createModule(req.params.id_course, req.body);
    res.status(201).json({ message: 'Módulo creado correctamente', module });
});

export const getModulesByCourse = catchAsync(async (req, res) => {
    const modules = await modulesService.getModulesByCourse(req.params.id_course);
    res.status(200).json({ modules });
});

export const getModuleById = catchAsync(async (req, res) => {
    const module = await modulesService.getModuleById(req.params.id);
    res.status(200).json({ module });
});

export const updateModule = catchAsync(async (req, res) => {
    const module = await modulesService.updateModule(req.params.id, req.body);
    res.status(200).json({ message: 'Módulo actualizado correctamente', module });
});

export const deleteModule = catchAsync(async (req, res) => {
    const result = await modulesService.deleteModule(req.params.id);
    res.status(200).json(result);
});