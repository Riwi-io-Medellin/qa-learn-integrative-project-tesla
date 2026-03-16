import * as routesService from './routes.service.js';
import catchAsync from '../../middlewares/catchAsync.js';

export const createRoute = catchAsync(async (req, res) => {
    const route = await routesService.createRoute(req.body);
    res.status(201).json({ message: 'Ruta creada correctamente', route });
});

export const getAllRoutes = catchAsync(async (req, res) => {
    const routes = await routesService.getAllRoutes(req.query.id_level);
    res.status(200).json({ routes });
});

export const getRouteById = catchAsync(async (req, res) => {
    const route = await routesService.getRouteById(req.params.id);
    res.status(200).json({ route });
});

export const updateRoute = catchAsync(async (req, res) => {
    const route = await routesService.updateRoute(req.params.id, req.body);
    res.status(200).json({ message: 'Ruta actualizada correctamente', route });
});

export const deleteRoute = catchAsync(async (req, res) => {
    const result = await routesService.deleteRoute(req.params.id);
    res.status(200).json(result);
});

export const addCourseToRoute = catchAsync(async (req, res) => {
    const result = await routesService.addCourseToRoute(req.params.id, req.body);
    res.status(201).json({ message: 'Curso agregado a la ruta correctamente', result });
});

export const removeCourseFromRoute = catchAsync(async (req, res) => {
    const result = await routesService.removeCourseFromRoute(req.params.id, req.params.courseId);
    res.status(200).json(result);
});