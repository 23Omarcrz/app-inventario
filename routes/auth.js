import { Router } from "express";
import { AuthController } from "../controllers/auth.js";
import { authMiddleware } from "../middlewares/auth.js";
import { forgotPasswordLimiter } from "../middlewares/rateLimit.js";

export const createAuthRouter = ({ authModel }) => {
    const authRouter = Router();
    const authController = new AuthController({ authModel });

    authRouter.post('/login', authController.login)
    authRouter.post('/register', authController.register)
    authRouter.get('/session', authMiddleware, authController.verifySesion)
    authRouter.post('/logout', authMiddleware, authController.logout)
    authRouter.post('/refresh', authController.refresh)
    authRouter.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
    authRouter.post("/reset-password", authController.resetPassword);

    return authRouter;
}