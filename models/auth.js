import { getConnection } from "./connection.js";
import bcrypt from 'bcrypt';
import 'dotenv/config'
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';

export class AuthModel {
    static async login({ input }) {
        const {username, password} = input;
        let connection;

        try {
            connection = await getConnection();

            const [rows] = await connection.query(
                //'SELECT * FROM Articulo WHERE usuario_id = ? AND categoria_id = ? LIMIT ?, ?;',[]
                'SELECT * FROM Administrador WHERE username = ?;', [username]
            )
            if (rows.length === 0) {
                const err = new Error("Usuario o contrasena incorrecta")
                err.code = "USER_NOT_FOUND"
                throw err;
            }
            const admin = rows[0];//esto es porque rows es un arreglo con el objeto
            // Esto le dice a bcrypt:
            // "Compara la contraseña enviada con el hash guardado"
/*             if (!admin.password) {
                const err = new Error("Usuario o contrasena incorrecta");
                err.code = "INVALID_PASSWORD_DATA";
                throw err;
            } */

            const validPassword = await bcrypt.compare(password, admin.password);

            if (!validPassword) {
                const err = new Error("Usuario o contrasena incorrecta");
                err.code = "INVALID_PASSWORD";
                throw err;
            }

            const accessToken = generateAccessToken({
                id_admin: admin.id_admin, username
            })

            const refreshToken = generateRefreshToken({
                id_admin: admin.id_admin
            });

            const { id_admin, nombre, apellidos } = admin;
            //res.status(200).json({ msg: "Login exitoso", usuario });
            return {id_admin, nombre, apellidos, username, accessToken, refreshToken}
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
        }
    }

    static async getAdminById(id_admin) {
        let connection;
        try {
            connection = await getConnection();

            const [rows] = await connection.query(
                'SELECT id_admin, username, nombre, apellidos FROM Administrador WHERE id_admin = ?;',
                [id_admin]
            );

            if (rows.length === 0) {
                const err = new Error("Usuario no encontrado");
                err.code = "ADMIN_NOT_FOUND";
                throw err;
            }

            return rows[0]; // devuelve solo los datos necesarios
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async registrar({ input }) {
        const {
            nombre,
            apellidos,
            email,
            username,
            password
        } = input;
        let connection;

        try {
            connection = await getConnection();

            // 1. Generar hash
            const saltRounds = 10;
            const hash = await bcrypt.hash(password, saltRounds);
            //const hash2 = bcrypt.hashSync(password, saltRounds);

            // 2. Insertar en la BD
            const [result] = await connection.query(
                `INSERT INTO Administrador (nombre, apellidos, correo, username, password)
                VALUES (?, ?, ?, ?, ?);`,
                [nombre, apellidos, email, username, hash]
            );

            if (result.affectedRows === 0) {
                const err = new Error("No se pudo registrar el usuario");
                err.code = "INSERT_FAILED";
                throw err;
            }

        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async findAdminByEmail(email) {
        let connection;

        try {
            connection = await getConnection();

            const [rows] = await connection.query(
                "SELECT id_admin, correo FROM Administrador WHERE correo = ?",
                [email]
            );
            return rows[0];
        } finally {
            connection.release();
        }
    }

    static async saveResetToken(id_admin, token) {
        const connection = await getConnection();

        try {
            await connection.query(
            `
                UPDATE Administrador
                SET reset_token = ?, reset_token_expires = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)
                WHERE id_admin = ?
            `,
                [token, id_admin]
            );
        } finally {
            connection.release();
        }
    }

    static async findUserByResetToken(token) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.query(
                `
                SELECT id_admin
                FROM Administrador
                WHERE reset_token = ?
                AND reset_token_expires > UTC_TIMESTAMP();
                `,
                [token]
            );
            return rows[0];
        } finally {
            connection.release();
        }
    }

    static async updatePassword(id_admin, hashedPassword) {
        const connection = await getConnection();

        try {
            await connection.query(
                `
                UPDATE Administrador
                SET password = ?, 
                    reset_token = NULL,
                    reset_token_expires = NULL
                WHERE id_admin = ?
                `,
                [hashedPassword, id_admin]
            );
        } catch (error){
            throw error
        }
        finally {
            connection.release();
        }
    }
}