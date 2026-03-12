import * as projectsRepository from './projects.repository.js';

export const getProjectById = async (id_project, id_user) => {
    const project = await projectsRepository.findProjectByIdAndUser(id_project, id_user);

    if (!project) {
        throw new Error('Project not found or access denied');
    }

    return project;
};

export const updateProject = async (id_project, id_user, fields) => {
    const project = await projectsRepository.findProjectByIdAndUser(id_project, id_user);

    if (!project) {
        throw new Error('Project not found or access denied');
    }

    const updated = await projectsRepository.updateProject(id_project, id_user, fields);
    return updated;
};
