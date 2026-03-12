import { connectPostgres } from './config/db.js';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import router from './routes/index.js';
import { errorHandler } from '../middlewares/error.middleware.js';

await connectPostgres();

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.use(router);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});


app.use(errorHandler);
export default app;