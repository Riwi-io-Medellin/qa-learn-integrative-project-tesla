import * as projectsRepository from './projects.repository.js';

const VALID_STATUSES = ['ACTIVE', 'COMPLETED', 'ARCHIVED'];

export const createProject = async (id_user, fields) => {
    return projectsRepository.createProject(id_user, fields);
};

export const updateProjectStatus = async (id_project, id_user, status) => {
    const project = await projectsRepository.getProjectByIdAndUser(id_project, id_user);
    if (!project) throw new Error('Project not found or access denied');

    if (!VALID_STATUSES.includes(status)) {
        throw new Error(`Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`);
    }

    return projectsRepository.updateProjectStatus(id_project, id_user, status);
};

export const getProjects = async (id_user, filters) => {
    return projectsRepository.getProjectsByUser(id_user, filters);
};

export const getProjectById = async (id_project, id_user) => {
    const project = await projectsRepository.getProjectByIdAndUser(id_project, id_user);
    if (!project) throw new Error('Project not found or access denied');
    return project;
};

export const updateProject = async (id_project, id_user, fields) => {
    const project = await projectsRepository.getProjectByIdAndUser(id_project, id_user);
    if (!project) throw new Error('Project not found or access denied');
    const updated = await projectsRepository.updateProject(id_project, id_user, fields);
    return updated;
};

export const deleteProject = async (id_project, id_user) => {
    const project = await projectsRepository.deleteProject(id_project, id_user);
    if (!project) throw new Error('Project not found or access denied');
    return { message: 'Project deleted successfully' };
};
