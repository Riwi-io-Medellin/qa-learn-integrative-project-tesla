import { Router } from "express";
import { getLevels } from "./levels.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

export const levelsRoutes = Router();

levelsRoutes.get("/", authMiddleware, getLevels);