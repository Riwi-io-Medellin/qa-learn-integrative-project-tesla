import cors from 'cors';
import { connectPostgres } from './config/db.js';
import express from 'express';
import { env } from './config/env.js';
import { authRoutes }         from './modules/auth/auth.routes.js';
import { diagnosticRoutes }   from './modules/diagnostic/diagnostic.routes.js';
import { projectsRoutes }     from './modules/projects/projects.routes.js';
import { requirementsRoutes } from './modules/requirements/requirements.routes.js';
import { testCasesRoutes }    from './modules/testCases/testCases.routes.js';
import { usersRoutes }        from './modules/users/users.routes.js';
import { coursesRoutes }      from './modules/courses/courses.routes.js';
import { modulesRoutes }      from './modules/course-modules/modules.routes.js';
import { executionsRoutes }   from './modules/executions/executions.routes.js';
import { evidencesRoutes }    from './modules/evidences/evidences.routes.js';
import { learningRoutes }     from './modules/learning-routes/routes.routes.js';
import { libraryRoutes }      from './modules/library/library.routes.js';
import { levelsRoutes }       from './modules/levels-roles/levels.routes.js';
import { stepsRoutes }        from './modules/steps/step.routes.js';

import { errorHandler }       from './middlewares/error.middleware.js';

await connectPostgres();

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

// ── Auth & Users ─────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/users',  usersRoutes);

// ── Diagnostic ───────────────────────────────────────────────────────────
app.use('/api/diagnostic', diagnosticRoutes);

// ── Projects → Requirements → Test Cases → Steps ─────────────────────────
app.use('/api/projects',                          projectsRoutes);
app.use('/api/projects/:id/requirements',         requirementsRoutes);
app.use('/api/projects/:id/test-cases',           testCasesRoutes);
app.use('/api/test-cases/:case_id/steps',         stepsRoutes);

// ── Courses → Modules ────────────────────────────────────────────────────
app.use('/api/courses',                           coursesRoutes);
app.use('/api/courses/:id_course/modules',        modulesRoutes);

// ── Executions → Evidences ───────────────────────────────────────────────
app.use('/api/executions',                        executionsRoutes);
app.use('/api/executions/:id_execution/evidences', evidencesRoutes);

// ── Learning Routes & Library ────────────────────────────────────────────
app.use('/api/routes',  learningRoutes);
app.use('/api/library', libraryRoutes);

// ── Levels / Roles ───────────────────────────────────────────────────────
app.use('/api/', levelsRoutes);

// ── Health check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Global error handler ─────────────────────────────────────────────────
app.use(errorHandler);

export default app;
