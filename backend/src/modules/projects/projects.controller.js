import * as projectsService from './projects.service.js';

export const createProject = async (req, res) => {
    try {
        const id_user = req.user.id;
        const project = await projectsService.createProject(id_user, req.body);
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateProjectStatus = async (req, res) => {
    try {
        const id_user = req.user.id;
        const { id } = req.params;
        const { status } = req.body;
        const updated = await projectsService.updateProjectStatus(id, id_user, status);
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getProjects = async (req, res) => {
    try {
        const id_user = req.user.id;
        const { status, page, limit } = req.query;
        const projects = await projectsService.getProjects(id_user, { status, page, limit });
        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const id_user = req.user.id;
        const { id } = req.params;
        const project = await projectsService.getProjectById(id, id_user);
        res.status(200).json(project);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const id_user = req.user.id;
        const { id } = req.params;
        const updated = await projectsService.updateProject(id, id_user, req.body);
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const deleteProject = async (req, res) => {
    try {
        const id_user = req.user.id;
        const { id } = req.params;
        const result = await projectsService.deleteProject(id, id_user);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
