import * as projectService from './projects.service.js';

export const create = async (req, res) => {
    try{
        const { name,description } = req.body; 
        const id_user =  req.user.id; 

        const project = await projectService.createProjectService({ id_user, name, description })

        res.status(201).json({
            message: "Project created seccessfully", 
            project
        }); 
    }catch(error){
        res.status(400).json({
            error: error.message
        }); 
    }
}; 

export const updateStatus = async (req, res) => {
    try {
        const { id_project } = req.params;
        const { status } = req.body;
        const user_id = req.user.id; 

        const updatedProject = await projectService.updateProjectStatusService({ 
            id_project, 
            user_id, 
            status 
        });

        res.status(200).json(updatedProject); 
    } catch(error) {
        // Return 403 for unauthorized, 404 for not found, 400 for bad request
        if (error.message.includes("Unauthorized")) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.includes("not found")) {
            return res.status(404).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
};

// ==========================================
// REQUIREMENTS CONTROLLERS
// ==========================================

export const createRequirement = async (req, res) => {
    try {
        const { id_project } = req.params;
        const { code, description, priority } = req.body;
        const user_id = req.user.id; 

        // The service assigns DRAFT status and validates project ownership & code uniqueness
        const requirement = await projectService.createRequirementService(user_id, id_project, {
            code,
            description,
            priority
        });

        res.status(201).json({
            message: "Requirement created successfully",
            requirement
        });
    } catch (error) {
        if (error.message.includes("Unauthorized")) {
            return res.status(403).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
};

export const getRequirements = async (req, res) => {
    try {
        const { id_project } = req.params;
        const user_id = req.user.id;

        const requirements = await projectService.getRequirementsService(user_id, id_project);

        res.status(200).json(requirements);
    } catch (error) {
        if (error.message.includes("Unauthorized")) {
            return res.status(403).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
};

export const updateRequirement = async (req, res) => {
    try {
        const { id_project, id_requirement } = req.params;
        const data = req.body; // status, code, description, priority
        const user_id = req.user.id;

        const updatedRequirement = await projectService.updateRequirementService(user_id, id_project, id_requirement, data);

        res.status(200).json({
            message: "Requirement updated successfully",
            requirement: updatedRequirement
        });
    } catch (error) {
        if (error.message.includes("Unauthorized")) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.includes("not found")) {
            return res.status(404).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
};

export const deleteRequirement = async (req, res) => {
    try {
        const { id_project, id_requirement } = req.params;
        const user_id = req.user.id;

        const deletedRequirement = await projectService.deleteRequirementService(user_id, id_project, id_requirement);

        res.status(200).json({
            message: "Requirement deleted successfully",
            requirement: deletedRequirement
        });
    } catch (error) {
        if (error.message.includes("Unauthorized")) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.includes("not found")) {
            return res.status(404).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
};