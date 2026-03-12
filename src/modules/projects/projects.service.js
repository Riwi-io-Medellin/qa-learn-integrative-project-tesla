import * as projectsRepository from "./projects.repository.js";

export const getProjects = async (id_user, filters) => {
    return await projectsRepository.getProjectsByUser(id_user, filters);
};

export const deleteProject = async (id_project, id_user) => {
    const project = await projectsRepository.deleteProject(id_project, id_user);
    if (!project) throw new Error("Proyecto no encontrado");
    return { message: "Proyecto eliminado correctamente" };
};