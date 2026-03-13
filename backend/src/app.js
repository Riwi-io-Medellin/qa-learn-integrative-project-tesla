import cors from 'cors';
import { connectPostgres } from "./config/db.js";
import express from 'express'; 
import { authRoutes } from "./modules/auth/auth.routes.js";
import { diagnosticRoutes } from "./modules/diagnostic/diagnostic.routes.js";
import { projectsRoutes } from "./modules/projects/projects.routes.js";

await connectPostgres(); 

const app = express(); 

app.use(cors({ origin: '*' }));
app.use(express.json()); 

app.use('/auth', authRoutes);
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/projects', projectsRoutes);

app.get("/health", (req,res) => {
    res.json({ status: "ok"}); 
}); 

export default app;


