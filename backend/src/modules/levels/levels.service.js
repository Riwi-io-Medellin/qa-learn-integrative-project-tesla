import * as levelsRepository from "./levels.repository.js";

export const getLevels = async () => {
    return await levelsRepository.getLevels();
};