import * as evidencesService from './evidences.service.js';
import catchAsync from '../../middlewares/catchAsync.js';

export const createEvidence = catchAsync(async (req, res) => {
    const { id_execution } = req.params;
    const { type, description } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Se requiere un archivo' });
    }

    const evidence = await evidencesService.createEvidence(id_execution, {
        type,
        description,
        file_path: file.filename,
        original_filename: file.originalname,
        file_size: file.size,
    });
    res.status(201).json({ message: 'Evidencia creada correctamente', evidence });
});

export const getEvidencesByExecution = catchAsync(async (req, res) => {
    const evidences = await evidencesService.getEvidencesByExecution(req.params.id_execution);
    res.status(200).json({ evidences });
});

export const getEvidenceById = catchAsync(async (req, res) => {
    const evidence = await evidencesService.getEvidenceById(req.params.id);
    res.status(200).json({ evidence });
});

export const updateEvidence = catchAsync(async (req, res) => {
    const evidence = await evidencesService.updateEvidence(req.params.id, req.body);
    res.status(200).json({ message: 'Evidencia actualizada correctamente', evidence });
});

export const deleteEvidence = catchAsync(async (req, res) => {
    const result = await evidencesService.deleteEvidence(req.params.id);
    res.status(200).json(result);
});