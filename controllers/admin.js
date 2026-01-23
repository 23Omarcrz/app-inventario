import { validateAddUser } from "../schemas/validAddUser.js";

export class AdminController {
    constructor({ adminModel }) {
        this.adminModel = adminModel;
    }

    getUsers = async(req, res) => {
        try {
            const id_admin = req.session.id_admin;
    
            const users = await this.adminModel.getUsers({ id_admin });
            return res.status(200).json({
                success: true,
                message: "usuarios filtrados",
                users
            });
        } catch (error) {
            if(error.code){
                if (error.code === "INVALID_ADMIN_ID"){
                    return res.status(400).json({
                        success: false,
                        code: "INVALID_ADMIN_ID",
                        message: "id_admin no válido"
                    });
                }
            }

            return res.status(500).json({ 
                success: false,
                code: "INTERNAL_SERVER_ERROR",
                message: "Error interno del servidor, intenta más tarde" 
            });
        }
    } 

    verifyUser = async(req, res) => {
        try {
            const { id_usuario } = req.params;
            const id_admin = req.session.id_admin;

            await this.adminModel.verifyUser({id_usuario, id_admin});

            return res.status(200).json({ 
                success: true,
                message: "Usuario verificado" 
            });
        } catch (error) {
            if (error.code) {
                if (error.code === "INVALID_ADMIN_ID") {
                    return res.status(400).json({
                        success: false,
                        code: "INVALID_ADMIN_ID",
                        message: "Administrador no válido"
                    });
                }

                if (error.code === "INVALID_USER_ID") {
                    return res.status(400).json({
                        success: false,
                        code: "INVALID_USER_ID",
                        message: "Usuario no válido"
                    });
                }

                if (error.code === "USER_NOT_FOUND") {
                    return res.status(404).json({
                        success: false,
                        code: error.code,
                        message: "El usuario no existe"
                    });
                }

            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Error interno del servidor, intenta más tarde" });
        }
    }

    addUser = async(req, res) => {
        const result = validateAddUser(req.body)

        if (result.error) {
            const parsedError = JSON.parse(result.error.message);

            const formattedErrors = parsedError.map((err) => {
                const userValue = req.body[err.path[0]];
                return {
                    ...err,
                    userValue: userValue 
                };
            });
            return res.status(400).json({ error: formattedErrors });
        }

        try {
            const id_admin = req.session.id_admin;
            const datos = Object.fromEntries(
                Object.entries(result.data).filter(([_, value]) => value !== "" && value !== undefined)
            );
            const user = await this.adminModel.addUser({input: {...datos, id_admin}});
            return res.status(201).json({
                success: true,
                message: "usuario registrado",
                newUser: user
            });
        } catch (error) {
            if (error.code) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, code: "DUPLICATE_USER", message: 'El usuario ya existe para este administrador' });
                }
                if (error.code === "ER_NO_REFERENCED_ROW_2") {
                    return res.status(400).json({
                        success: false,
                        code: "INVALID_ADMIN_REFERENCE",
                        message: "Administrador no válido"
                    });
                }

            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: 'Error interno del servidor, intenta más tarde' });
        }
    }

    deleteUsers = async (req, res) => {
        try {
            const id_admin = req.session.id_admin;
            const usuarios = req.body;

            if (!Array.isArray(usuarios) || usuarios.length === 0) {
                return res.status(400).json({
                    success: false,
                    code: "INVALID_PAYLOAD",
                    message: "Debe enviar un arreglo de usuarios válido"
                });
            }

            await this.adminModel.deleteUsers({idUsuarios: usuarios, id_admin});

            return res.status(200).json({
                success: true,
                message: "Usuarios eliminados correctamente",
                deletedUsers: usuarios // ← array de IDs
            });

        } catch (error) {
            if (error.code) {

                if (error.code === "INVALID_ADMIN_ID") {
                    return res.status(401).json({
                        success: false,
                        code: "INVALID_ADMIN_ID",
                        message: "Administrador no válido"
                    });
                }

                if (error.code === "INVALID_USERS") {
                    return res.status(403).json({
                        success: false,
                        code: "INVALID_USERS",
                        message: "Uno o más usuarios no pertenecen a este administrador"
                    });
                }

                if (error.code === "ER_LOCK_DEADLOCK") {
                    return res.status(409).json({
                        success: false,
                        code: "DEADLOCK",
                        message: "Conflicto al eliminar usuarios, intenta nuevamente"
                    });
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);

            return res.status(500).json({
                success: false,
                code: "INTERNAL_SERVER_ERROR",
                message: "Error interno del servidor, intenta más tarde"
            });
        }
    }

}