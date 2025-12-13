import { getConnection } from "./connection.js";
import bcrypt from 'bcrypt';

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
            const validPassword = await bcrypt.compare(password, admin.password);

            if (!validPassword) {
                const err = new Error("Usuario o contrasena incorrecta");
                err.code = "INVALID_PASSWORD";
                throw err;
            }

            const { id_admin, nombre, apellidos } = admin;
            //res.status(200).json({ msg: "Login exitoso", usuario });
            return {id_admin, nombre, apellidos, username}
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
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

            // 2. Insertar en la BD
            await connection.query(
             `INSERT INTO Administrador (nombre, apellidos, correo, username, password)
             VALUES (?, ?, ?, ?, ?);`,
                [nombre, apellidos, email, username, hash]
            );

            return { success: true };

        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}