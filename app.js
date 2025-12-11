import express from 'express';
import { createAuthRouter } from './routes/auth.js';
import { corsMiddleware } from './middlewares/cors.js';
import { createAdminRouter } from './routes/admin.js';

export const createApp = ({authModel, adminModel}) => {
    const app = express();

    app.disable('x-powered-by');
    app.use(express.json());
    app.use(corsMiddleware());
    
    //app.use('/admin', );
    app.use('/auth', createAuthRouter({ authModel }));
    app.use('/admin', createAdminRouter({ adminModel }));

    const PORT = process.env.PORT ?? 3000;

    app.listen(PORT, () => {
        console.log(`Server listening on: http://localhost:${PORT}`);
    })
}


