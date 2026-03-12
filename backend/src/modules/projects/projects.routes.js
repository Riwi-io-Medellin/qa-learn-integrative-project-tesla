import { Router } from 'express'; 
import { 
    create, 
    updateStatus,
    createRequirement,
    getRequirements,
    updateRequirement,
    deleteRequirement
} from './projects.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const projectsRoutes = Router(); 

projectsRoutes.post('/create', authMiddleware, create);

projectsRoutes.patch('/:id_project/status', authMiddleware, updateStatus);

// Requirements
projectsRoutes.post('/:id_project/requirements', authMiddleware, createRequirement);
projectsRoutes.get('/:id_project/requirements', authMiddleware, getRequirements);
projectsRoutes.patch('/:id_project/requirements/:id_requirement', authMiddleware, updateRequirement);
projectsRoutes.put('/:id_project/requirements/:id_requirement', authMiddleware, updateRequirement);
projectsRoutes.delete('/:id_project/requirements/:id_requirement', authMiddleware, deleteRequirement);
