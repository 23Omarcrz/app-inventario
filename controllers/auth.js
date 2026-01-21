import { validateLogin } from "../schemas/validLogin.js";
import { validateRegister } from "../schemas/validRegister.js";
import 'dotenv/config'
import { generateAccessToken } from "../utils/tokens.js";
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendEmail.js";
import { resetPasswordEmail } from "../utils/resetPasswordEmail.js";
import { validateResetPassword } from "../schemas/validResetPass.js";

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
            const {accessToken, refreshToken, ...adminData} = admin;

            return res.cookie('access_token', accessToken, {
                httpOnly: true,
                //secure: false, // true en producción con HTTPS
                secure: false,//process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000
            }).cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            }).status(200).json({
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
            await this.authModel.registrar({ input: result.data });
            return res.status(201).json({
                success: true,
                message: "usuario registrado",
            });
        } catch (error) {
            if (error.code) {
                if (error.code === 'ER_DUP_ENTRY') {
                    if (error.message.includes("uq_admin_correo")) {
                        return res.status(409).json({ success: false, code: "DUPLICATE_EMAIL", message: 'El correo ya existe' });
                    }

                    if (error.message.includes("uq_admin_username")) {
                        return res.status(409).json({ success: false, code: "DUPLICATE_USERNAME", message: 'El usuario ya existe' });
                    }
                }

                if (error.code === 'INSERT_FAILED') {
                    return res.status(500).json({ success: false, code: "INSERT_FAILED", message: 'No se pudo registrar al usuario' });
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: 'Ocurrió un error interno, intenta más tarde' });
        }
    }

    verifySesion = async (req, res) => {
        try {
            const adminData = await this.authModel.getAdminById(req.session.id_admin);
            res.json({ adminData });
        } catch (error) {
            if (error.code) {
                if (error.code === "ADMIN_NOT_FOUND") {
                    return res.status(401).json({ success: false, code: "INVALID_SESSION", message: "Sesión inválida" });
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: 'Ocurrió un error interno, intenta más tarde :(' });
        }
    }

    logout = (req, res) => {
        res
        .clearCookie('access_token')
        .clearCookie('refresh_token')
        .status(200)
        .json({
            success: true,
            message: 'Logout successful'
        });
    }

    refresh = (req, res) => {
        const refreshToken = req.cookies.refresh_token;
        

        if (!refreshToken) {
            return res.status(401).json({ 
                success: false,
                code: "NO_REFRESH_TOKEN",
                message: 'No utenticado'
            });
        }

        try {

            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );

            const newAccessToken = generateAccessToken({
                id_admin: decoded.id_admin
            });

            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000
            });

            return res.json({ success: true });
        } catch (err) {
            return res.status(401).json({
                success: false,
                code: "INVALID_REFRESH_TOKEN",
                message: "Sesión expirada, vuelve a iniciar sesión"
            });
        }
    }

    forgotPassword = async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "El correo es obligatorio"
            });
        }

        try {
            // 1️⃣ Buscar admin por email
            const admin = await this.authModel.findAdminByEmail(email);

            // ⚠️ IMPORTANTE: responder igual aunque no exista
            if (!admin) {
                return res.status(200).json({
                    message: "Se enviaron instrucciones a su correo electronico"
                });
            }

            // 2️⃣ Generar token seguro
            const token = crypto.randomBytes(32).toString("hex");

            // 4️⃣ Guardar token
            await this.authModel.saveResetToken(admin.id_admin, token);

            const resetURL = `${process.env.FRONT_URL}/reset-password/${token}`;
            await sendEmail({
                to: admin.correo,
                subject: "Restablecer contraseña",
                html: resetPasswordEmail(resetURL)
            });

            // 5️⃣ RESPUESTA (correo lo vemos después)
            return res.status(200).json({
                message: "Se enviaron instrucciones a su correo electronico"
            });

        } catch (error) {
            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: 'Ocurrió un error interno, intenta más tarde :(' });
        }
    }

    resetPassword = async (req, res) => {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token y contraseña son obligatorios"
            });
        }

        try {
            // 1️⃣ Buscar usuario por token válido
            const admin = await this.authModel.findUserByResetToken(token);

            if (!admin) {
                return res.status(400).json({
                    success: false,
                    code: "NO_VALID_TOKEN",
                    message: "Solicitud inválida o expirada"
                });
            }

            const result = validateResetPassword({ password })
            if (result.error) {

                const parsedError = JSON.parse(result.error.message);

                const formattedErrors = parsedError.map((err) => {

                    const userValue = req.body[err.path[0]];

                    return {
                        ...err,
                        userValue: userValue 
                    };
                });
                return res.status(400).json({ 
                    success: false,
                    code: "INVALID_PASSWORD",
                    error: formattedErrors 
                });
            }

            // 2️⃣ Hashear nueva contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // 3️⃣ Guardar contraseña y limpiar token
            await this.authModel.updatePassword(admin.id_admin, hashedPassword);

            return res.status(200).json({
                succes: true,
                message: "Contraseña actualizada correctamente"
            });

        } catch (error) {
            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: 'Ocurrió un error interno, intenta más tarde :(' });
        }
    }

}