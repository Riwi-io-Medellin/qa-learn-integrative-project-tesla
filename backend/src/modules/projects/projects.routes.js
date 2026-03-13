import { Router } from "express";
import { getProjects, deleteProject } from "./projects.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

export const projectsRoutes = Router();

projectsRoutes.get("/", authMiddleware, getProjects);
projectsRoutes.delete("/:id", authMiddleware, deleteProject);