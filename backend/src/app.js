import cors from 'cors';
import { connectPostgres } from './config/db.js';
import express from 'express';
import { env } from './config/env.js';
import { authRoutes }         from './modules/auth/auth.routes.js';
import { diagnosticRoutes }   from './modules/diagnostic/diagnostic.routes.js';
import { projectsRoutes }     from './modules/projects/projects.routes.js';
import { requirementsRoutes } from './modules/requirements/requirements.routes.js';
import { testCasesRoutes }    from './modules/testCases/testCases.routes.js';

await connectPostgres();

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.use('/api/auth',                      authRoutes);
app.use('/api/diagnostic',                diagnosticRoutes);
app.use('/api/projects',                  projectsRoutes);
app.use('/api/projects/:id/requirements', requirementsRoutes);
app.use('/api/projects/:id/test-cases',   testCasesRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

export default app;
