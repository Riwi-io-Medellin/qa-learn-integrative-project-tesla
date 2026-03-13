import * as projectsService from "./projects.service.js";

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