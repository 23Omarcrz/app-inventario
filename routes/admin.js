import { Router } from "express";
import { AdminController } from "../controllers/admin.js";

export const createAdminRouter = ({ adminModel }) => {
    const adminRouter = Router();
    const adminController = new AdminController({ adminModel });

    adminRouter.get('/', adminController.getUsers)

    return adminRouter;
}