import { Router } from "express";
import { AdminController } from "../controllers/admin.js";

export const createAdminRouter = ({ adminModel }) => {
    const adminRouter = Router();
    const adminController = new AdminController({ adminModel });

    // 1. Obtener TODOS los usuarios del admin
    adminRouter.get('/:id_admin/usuarios', adminController.getUsers);
    adminRouter.get('/:id_admin/usuario/:id_usuario', adminController.verifyUser);

    return adminRouter;
}