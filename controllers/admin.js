export class AdminController {
    constructor({ adminModel }) {
        this.adminModel = adminModel;
    }

    getUsers = async(req, res) => {
        // /admin?id=6sdfsljk
        try {
            let { id_admin } = req.params;
            id_admin = Number(id_admin);

            const token = req.cookies.token;
    
            const users = await this.adminModel.getUsers({ id_admin });
            return res.status(200).json({
                success: true,
                message: "usuarios filtrados",
                users
            });
        } catch (error) {
            /* if(error.code){
                if (error.code === "USERS_NOT_FOUND"){
                    return res.status(404).json({
                        success: false,
                        code: error.code,
                        message: "No se encontraron usuarios"
                    });
                }
            } */

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ 
                success: false,
                code: error.code,
                message: "Ocurrió un error interno, intenta más tarde" 
            });
        }
        // que es lo que renderiza
        //res.json(users);
    } 

    verifyUser = async(req, res) => {
        // si se usa token de autenticacion podemos hacer lo siguiente
        // const id_admin = req.user.id; // extraído del token
        try {
            const { id_usuario, id_admin } = req.params;

            const usuario = await this.adminModel.verifyUser({id_usuario, id_admin});

            return res.status(200).json({ 
                success: usuario.success,
                message: "Usuario verificado" 
            });
        } catch (error) {
            if (error.code) {
                if (error.code === "USER_NOT_FOUND") {
                    return res.status(404).json({
                        success: false,
                        code: error.code,
                        message: "El usuario no existe"
                    });
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Ocurrió un error interno, intenta más tarde" });
        }
    }
}