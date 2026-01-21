import { Router } from "express";
import { AdminController } from "../controllers/admin.js";

export const createAdminRouter = ({ adminModel }) => {
    const adminRouter = Router();
    const adminController = new AdminController({ adminModel });

    // 1. Obtener TODOS los usuarios del admin
    adminRouter.get('/usuarios', adminController.getUsers);
    adminRouter.get('/usuario/:id_usuario', adminController.verifyUser);
    adminRouter.post('/usuario/nuevoUsuario', adminController.addUser)
    adminRouter.delete('/usuarios/delete', adminController.deleteUsers)

    return adminRouter;
}