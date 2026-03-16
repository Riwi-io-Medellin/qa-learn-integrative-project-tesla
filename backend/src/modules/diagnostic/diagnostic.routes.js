import { Router } from "express";
import { createDiagnostic, getDiagnostics, getDiagnosticById } from "./diagnostic.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

export const diagnosticRoutes = Router();

diagnosticRoutes.post("/", authMiddleware, createDiagnostic);
diagnosticRoutes.get("/", authMiddleware, getDiagnostics);
diagnosticRoutes.get("/:id", authMiddleware, getDiagnosticById);