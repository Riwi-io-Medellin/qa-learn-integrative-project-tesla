import * as levelsService from "./levels.service.js";

export const getLevels = async (req, res) => {
    try {
        const levels = await levelsService.getLevels();
        res.status(200).json(levels);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};