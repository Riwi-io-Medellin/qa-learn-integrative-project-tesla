import * as diagnosticService from "./diagnostic.service.js";

export const createDiagnostic = async (req, res) => {
    try {
        const { score, id_level, id_route } = req.body;
        const id_user = req.user.id; // viene del JWT via authMiddleware

        const diagnostic = await diagnosticService.createDiagnostic({ id_user, score, id_level, id_route });
        res.status(201).json(diagnostic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getDiagnostics = async (req, res) => {
    try {
        const id_user = req.user.id;
        const diagnostics = await diagnosticService.getDiagnosticsByUser(id_user);
        res.status(200).json(diagnostics);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getDiagnosticById = async (req, res) => {
    try {
        const id_user = req.user.id;
        const { id } = req.params;
        const diagnostic = await diagnosticService.getDiagnosticById(id, id_user);
        res.status(200).json(diagnostic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};