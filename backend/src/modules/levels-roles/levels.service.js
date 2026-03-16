import * as levelsRepository from './levels.repository.js';

export const getAllLevels = async () => {
    return await levelsRepository.findAllLevels();
};

export const getAllRoles = async () => {
    return await levelsRepository.findAllRoles();
};