import { validateLogin } from "../schemas/validLogin.js";
import { validateRegister } from "../schemas/validRegister.js";
import 'dotenv/config'

export class AuthController {
    constructor({ authModel }) {
        this.authModel = authModel;
    }

    login = async (req, res) => {
        //validamos con zod
        const result = validateLogin(req.body);
        if (result.error) {
            // Parseamos el error de Zod
            //console.log(result.error.message)
            const parsedError = JSON.parse(result.error.message);

            // Iteramos sobre los errores para agregar el valor ingresado por el usuario
            const formattedErrors = parsedError.map((err) => {
                // Obtenemos el valor que el usuario ingresó para el campo específico
                const userValue = req.body[err.path[0]];  // `err.path[0]` es el campo que causó el error

                // Modificamos el mensaje para incluir el valor ingresado
                return {
                    ...err,
                    userValue: userValue  // Añadimos el valor ingresado por el usuario al error
                };
            });

            // Imprimimos los errores con el valor ingresado para enviar al frontend
            //console.log("Error que se enviará al front:", formattedErrors);

            // Devolvemos los errores con el valor ingresado
            return res.status(400).json({ error: formattedErrors });
        }
        // enviamos los datos
        try {
            const admin = await this.authModel.login({ input: result.data });
            const {token, ...adminData} = admin;

            res.cookie('token', token, {
                httpOnly: true,
                //secure: false, // true en producción con HTTPS
                secure: false,//process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 1000
            })
            return res.status(200).json({
                success: true,
                message: "Login exitoso",
                adminData
            });
        } catch (error) {
            if (error.code) {
                if (error.code === "USER_NOT_FOUND" || error.code === "INVALID_PASSWORD") {
                    return res.status(401).json({ success: false, code: "INVALID_USER_OR_PASSWORD", message: "Usuario o contraseña incorrecta" });
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: 'Ocurrió un error interno, intenta más tarde :(' });
        }   
    }

    register = async (req, res) => {
        const result = validateRegister(req.body);
        if (result.error) {
            // Parseamos el error de Zod
            //console.log(result.error.message)
            const parsedError = JSON.parse(result.error.message);

            // Iteramos sobre los errores para agregar el valor ingresado por el usuario
            const formattedErrors = parsedError.map((err) => {
                // Obtenemos el valor que el usuario ingresó para el campo específico
                const userValue = req.body[err.path[0]];  // `err.path[0]` es el campo que causó el error

                // Modificamos el mensaje para incluir el valor ingresado
                return {
                    ...err,
                    userValue: userValue  // Añadimos el valor ingresado por el usuario al error
                };
            });

            // Imprimimos los errores con el valor ingresado para enviar al frontend
            //console.log("Error que se enviará al front:", formattedErrors);

            // Devolvemos los errores con el valor ingresado
            return res.status(400).json({ error: formattedErrors });
        }

        try {
            const response = await this.authModel.registrar({ input: result.data });
            return res.status(201).json({
                success: response.success,
                message: "usuario registrado",
            });
        } catch (error) {
            if (error.code) {
                if (error.code === 'ER_DUP_ENTRY') {
                    if (error.message.includes("correo")) {
                        return res.status(409).json({ success: false, code: "EMAIL_DUPLICATED", message: 'El correo ya existe' });
                    }

                    if (error.message.includes("username")) {
                        return res.status(409).json({ success: false, code: "USERNAME_DUPLICATED", message: 'El usuario ya existe' });
                    }
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: 'Ocurrió un error interno, intenta más tarde :(' });
        }
    }
}