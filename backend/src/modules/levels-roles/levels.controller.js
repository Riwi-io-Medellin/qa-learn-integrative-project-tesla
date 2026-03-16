import * as levelsService from './levels.service.js';
import catchAsync from '../../middlewares/catchAsync.js';

export const getAllLevels = catchAsync(async (req, res) => {
    const levels = await levelsService.getAllLevels();
    res.status(200).json({ levels });
});

export const getAllRoles = catchAsync(async (req, res) => {
    const roles = await levelsService.getAllRoles();
    res.status(200).json({ roles });
});