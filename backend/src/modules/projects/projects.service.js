import * as projectsRepository from "./projects.repository.js"; 

export const createProjectService = async (data) => {
    const { id_user, name, description } = data; 

    //Create project 
    const project = await projectsRepository.createProject({
        id_user,
        name,
        description
    }); 

    return project; 
}; 


export const updateProjectStatusService = async (data) => {
    const { id_project, user_id, status } = data;

    const project = await projectsRepository.getProjectById(id_project);

    if (!project) {
        throw new Error("Project not found");
    }

    if (project.id_user !== user_id) {
        throw new Error("Unauthorized: you do not have permission to update this project");
    }

    const updatedProject = await projectsRepository.updateProjectStatus(id_project, status);
    
    return updatedProject;
}; 

// ==========================================
// REQUIREMENTS SERVICES
// ==========================================

export const createRequirementService = async (user_id, id_project, data) => {
    const { code, description, priority } = data;

    // Verify project belongs to user
    const project = await projectsRepository.getProjectById(id_project);
    if (!project) throw new Error("Project not found");
    if (project.id_user !== user_id) throw new Error("Unauthorized: you do not have permission to modify this project");

    // Check if duplicate code exists
    const existingRequirement = await projectsRepository.findRequirementByCodeAndProject(code, id_project);
    if (existingRequirement) throw new Error("Requirement with this code already exists in this project");

    // Create the requirement
    const requirement = await projectsRepository.createRequirement({
        id_project,
        code,
        description,
        priority
    });

    return requirement;
};

export const getRequirementsService = async (user_id, id_project) => {
    const project = await projectsRepository.getProjectById(id_project);
    if (!project) throw new Error("Project not found");
    if (project.id_user !== user_id) throw new Error("Unauthorized: you do not have permission to view this project");

    const requirements = await projectsRepository.getRequirementsByProject(id_project);
    return requirements;
};

export const updateRequirementService = async (user_id, id_project, id_requirement, data) => {
    const project = await projectsRepository.getProjectById(id_project);
    if (!project) throw new Error("Project not found");
    if (project.id_user !== user_id) throw new Error("Unauthorized: you do not have permission to modify this project");

    const requirementExists = await projectsRepository.getRequirementById(id_requirement);
    if (!requirementExists || requirementExists.id_project !== parseInt(id_project)) {
        throw new Error("Requirement not found in this project");
    }

    if (data.code && data.code !== requirementExists.code) {
        const existingCode = await projectsRepository.findRequirementByCodeAndProject(data.code, id_project);
        if (existingCode) throw new Error("Requirement with this code already exists in this project");
    }

    const updatedRequirement = await projectsRepository.updateRequirement(id_requirement, data);
    return updatedRequirement;
};

export const deleteRequirementService = async (user_id, id_project, id_requirement) => {
    const project = await projectsRepository.getProjectById(id_project);
    if (!project) throw new Error("Project not found");
    if (project.id_user !== user_id) throw new Error("Unauthorized: you do not have permission to modify this project");

    const requirementExists = await projectsRepository.getRequirementById(id_requirement);
    if (!requirementExists || requirementExists.id_project !== parseInt(id_project)) {
        throw new Error("Requirement not found in this project");
    }

    const deletedRequirement = await projectsRepository.deleteRequirement(id_requirement);
    return deletedRequirement;
};