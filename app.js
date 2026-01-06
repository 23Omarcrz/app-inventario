import express from 'express';
import { createAuthRouter } from './routes/auth.js';
import { corsMiddleware } from './middlewares/cors.js';
import { createAdminRouter } from './routes/admin.js';
import { createInventoryRouter } from './routes/inventory.js';
import { authMiddleware } from './middlewares/auth.js';
import cookieParser from 'cookie-parser';

export const createApp = ({authModel, adminModel, inventoryModel}) => {
    const app = express();

    app.disable('x-powered-by');
    app.use(express.json());
    app.use(cookieParser());// “Si la petición trae un header Cookie, léelo, sepáralo y ponlo en req.cookies”.
    app.use(corsMiddleware());
    /*
        const middleware = corsMiddleware();
        app.use(middleware);
    */
    
    //app.use('/admin', );
    app.use('/auth', createAuthRouter({ authModel }));
    app.use('/admin', authMiddleware, createAdminRouter({ adminModel }));
    app.use('/inventario', authMiddleware, createInventoryRouter({ inventoryModel }));

    const PORT = process.env.PORT ?? 3000;

    app.listen(PORT, () => {
        console.log(`Server listening on: http://localhost:${PORT}`);
    })
}


