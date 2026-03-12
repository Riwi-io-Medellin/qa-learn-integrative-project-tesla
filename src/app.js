import { connectPostgres } from "./config/db.js";
import express from 'express'; 
import { authRoutes } from "./modules/auth/auth.routes.js";
<<<<<<< HEAD
import { projectsRoutes }     from "./modules/projects/projects.routes.js";
=======
>>>>>>> 06427c379f81f0ba1b79067b5bd328bf8a88d4fa

await connectPostgres(); 

const app = express(); 

app.use(express.json()); 

<<<<<<< HEAD
app.use('/auth',                                      authRoutes);
app.use('/api/projects',                              projectsRoutes);

=======
app.use('/auth', authRoutes)
>>>>>>> 06427c379f81f0ba1b79067b5bd328bf8a88d4fa

app.get("/health", (req,res) => {
    res.json({ status: "ok"}); 
}); 

export default app; 