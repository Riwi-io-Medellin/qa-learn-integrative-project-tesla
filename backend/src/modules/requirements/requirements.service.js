import * as requirementsRepository from './requirements.repository.js';

const VALID_STATUSES   = ['DRAFT', 'APPROVED', 'DEPRECATED'];
const VALID_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

const assertProjectOwnership = async (id_project, id_user) => {
    const project = await requirementsRepository.findProjectByIdAndUser(id_project, id_user);
    if (!project) throw new Error('Project not found or access denied');
};

export const getRequirements = async (id_project, id_user, filters) => {
    await assertProjectOwnership(id_project, id_user);
    return requirementsRepository.findRequirementsByProject(id_project, filters);
};

export const getRequirementById = async (id_project, id_requirement, id_user) => {
    await assertProjectOwnership(id_project, id_user);
    const requirement = await requirementsRepository.findRequirementById(id_requirement, id_project);
    if (!requirement) throw new Error('Requirement not found');
    return requirement;
};

export const createRequirement = async (id_project, id_user, fields) => {
    await assertProjectOwnership(id_project, id_user);

    if (fields.priority && !VALID_PRIORITIES.includes(fields.priority)) {
        throw new Error(`Invalid priority. Valid values: ${VALID_PRIORITIES.join(', ')}`);
    }

    const duplicate = await requirementsRepository.findRequirementByCode(id_project, fields.code);
    if (duplicate) throw new Error(`Code "${fields.code}" already exists in this project`);

    return requirementsRepository.createRequirement(id_project, fields);
};

export const updateRequirement = async (id_project, id_requirement, id_user, fields) => {
    await assertProjectOwnership(id_project, id_user);

    const requirement = await requirementsRepository.findRequirementById(id_requirement, id_project);
    if (!requirement) throw new Error('Requirement not found');

    if (fields.priority && !VALID_PRIORITIES.includes(fields.priority)) {
        throw new Error(`Invalid priority. Valid values: ${VALID_PRIORITIES.join(', ')}`);
    }

    const duplicate = await requirementsRepository.findRequirementByCode(id_project, fields.code, id_requirement);
    if (duplicate) throw new Error(`Code "${fields.code}" already exists in this project`);

    return requirementsRepository.updateRequirement(id_requirement, id_project, fields);
};

export const updateRequirementStatus = async (id_project, id_requirement, id_user, status) => {
    await assertProjectOwnership(id_project, id_user);

    const requirement = await requirementsRepository.findRequirementById(id_requirement, id_project);
    if (!requirement) throw new Error('Requirement not found');

    if (!VALID_STATUSES.includes(status)) {
        throw new Error(`Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`);
    }

    return requirementsRepository.updateRequirementStatus(id_requirement, id_project, status);
};

export const deleteRequirement = async (id_project, id_requirement, id_user) => {
    await assertProjectOwnership(id_project, id_user);

    const requirement = await requirementsRepository.findRequirementById(id_requirement, id_project);
    if (!requirement) throw new Error('Requirement not found');

    const linkedCase = await requirementsRepository.findTestCasesByRequirement(id_requirement);
    if (linkedCase) throw new Error('Requirement has associated test cases and cannot be deleted');

    await requirementsRepository.deleteRequirement(id_requirement, id_project);
};
