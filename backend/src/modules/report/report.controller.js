import { getProjectReport } from './report.repository.js';

export const getReport = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user = req.user.id;
        const report = await getProjectReport(id, id_user);
        if (!report) return res.status(404).json({ error: 'Proyecto no encontrado.' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
