import * as routesRepository from './routes.repository.js';

export const createRoute = async (data) => {
    const existing = await routesRepository.findRouteByName(data.route_name);
    if (existing) throw new Error('Ya existe una ruta con ese nombre');

    const route = await routesRepository.createRoute(data);
    return route;
};

export const getAllRoutes = async (id_level) => {
    const routes = await routesRepository.findAllRoutes(id_level);
    return routes;
};

export const getRouteById = async (id) => {
    const route = await routesRepository.findRouteById(id);
    if (!route) throw new Error('Ruta no encontrada');
    return route;
};

export const updateRoute = async (id, data) => {
    const route = await routesRepository.findRouteById(id);
    if (!route) throw new Error('Ruta no encontrada');

    const updated = await routesRepository.updateRoute(id, data);
    return updated;
};

export const deleteRoute = async (id) => {
    const route = await routesRepository.findRouteById(id);
    if (!route) throw new Error('Ruta no encontrada');

    await routesRepository.deleteRoute(id);
    return { message: 'Ruta eliminada correctamente' };
};

export const addCourseToRoute = async (id_route, data) => {
    const route = await routesRepository.findRouteById(id_route);
    if (!route) throw new Error('Ruta no encontrada');

    const existing = await routesRepository.findCourseInRoute(id_route, data.id_course);
    if (existing) throw new Error('El curso ya está en esta ruta');

    const result = await routesRepository.addCourseToRoute(id_route, data.id_course, data.orders);
    return result;
};

export const removeCourseFromRoute = async (id_route, id_course) => {
    const existing = await routesRepository.findCourseInRoute(id_route, id_course);
    if (!existing) throw new Error('El curso no está en esta ruta');

    await routesRepository.removeCourseFromRoute(id_route, id_course);
    return { message: 'Curso eliminado de la ruta correctamente' };
};