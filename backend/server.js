import app from './src/app.js';
import { env } from './src/config/env.js';

const server = app.listen(env.port, () => {
    console.log(`Server running at http://localhost:${env.port}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Error: port ${env.port} is already in use`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});
