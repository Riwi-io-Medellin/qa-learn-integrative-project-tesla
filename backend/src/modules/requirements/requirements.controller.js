import * as requirementsService from './requirements.service.js';

export const getRequirements = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user = req.user.id;
        const { status, priority } = req.query;

        const requirements = await requirementsService.getRequirements(id, id_user, { status, priority });
        res.status(200).json(requirements);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const getRequirementById = async (req, res) => {
    try {
        const { id, reqId } = req.params;
        const id_user = req.user.id;

        const requirement = await requirementsService.getRequirementById(id, reqId, id_user);
        res.status(200).json(requirement);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const createRequirement = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user = req.user.id;

        const requirement = await requirementsService.createRequirement(id, id_user, req.body);
        res.status(201).json(requirement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateRequirement = async (req, res) => {
    try {
        const { id, reqId } = req.params;
        const id_user = req.user.id;

        const updated = await requirementsService.updateRequirement(id, reqId, id_user, req.body);
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateRequirementStatus = async (req, res) => {
    try {
        const { id, reqId } = req.params;
        const id_user = req.user.id;
        const { status } = req.body;

        const updated = await requirementsService.updateRequirementStatus(id, reqId, id_user, status);
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteRequirement = async (req, res) => {
    try {
        const { id, reqId } = req.params;
        const id_user = req.user.id;

        await requirementsService.deleteRequirement(id, reqId, id_user);
        res.status(200).json({ message: 'Requirement deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
