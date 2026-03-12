import * as projectsService from './projects.service.js';

export const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user = req.user.id;

        const project = await projectsService.getProjectById(id, id_user);

        res.status(200).json(project);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user = req.user.id;

        const updated = await projectsService.updateProject(id, id_user, req.body);

        res.status(200).json(updated);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
