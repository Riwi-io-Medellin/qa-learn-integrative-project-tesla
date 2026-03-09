import { connectPostgres } from "./config/db.js";
import express from 'express'; 

await connectPostgres(); 

const app = express(); 

app.use(express.json()); 

app.get("/health", (req,res) => {
    res.json({ status: "ok"}); 
}); 

export default app; 