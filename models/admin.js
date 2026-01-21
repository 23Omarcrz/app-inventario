import { getConnection } from "./connection.js";

export class AdminModel {
    static async getUsers({ id_admin }) {
        let connection;

        if (!Number.isInteger(id_admin)) {
            const err = new Error("id_admin invalido")
            err.code = "INVALID_ADMIN_ID"
            throw err;
        }

        try {
            connection = await getConnection();
            const [users] = await connection.query(
                'SELECT id_usuario, nombre, apellidos, area FROM Usuario WHERE id_admin = ?;', [id_admin] 
            ) 
            /* if (users.length === 0) {
                const err = new Error("No se encontraron usuarios")
                err.code = "USERS_NOT_FOUND"
                throw err;
            } */
            
            return users
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
        }
    }

    static async verifyUser({id_usuario, id_admin}) {
        let connection;

        if (!Number.isInteger(id_admin)) {
            const err = new Error("id_admin invalido")
            err.code = "INVALID_ADMIN_ID"
            throw err;
        }

        if (!Number.isInteger(Number(id_usuario))) {
            const err = new Error("id_usuario invalido");
            err.code = "INVALID_USER_ID";
            throw err;
        }

        try {
            connection = await getConnection();
            const [rows] = await connection.query(
                'SELECT * FROM Usuario WHERE id_usuario = ? AND id_admin = ?;', [id_usuario, id_admin]
            );
            
            if (rows.length === 0) {
                const err = new Error("No se encontro al usuario")
                err.code = "USER_NOT_FOUND"
                throw err;
            }
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
        }
    }

    static async addUser({ input }) {
        let connection;

        if (!Number.isInteger(input.id_admin)) {
            const err = new Error("id_admin inválido");
            err.code = "INVALID_ADMIN_ID";
            throw err;
        }

        
        try {
            connection = await getConnection();

            // Obtenemos solo los campos que tienen valor
            const fields = Object.keys(input);
            const values = Object.values(input);

            // Armamos placeholders
            const placeholders = fields.map(() => "?").join(", "); // "?, ?, ?"

            // Ejecutamos
            await connection.query(
                `INSERT INTO Usuario (${fields.join(", ")}) VALUES (${placeholders});`, values);

            return true
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
    
    static async deleteUsers({ idUsuarios, id_admin }) {
        let connection;

        if (!Number.isInteger(id_admin)) {
            const err = new Error("id_admin inválido");
            err.code = "INVALID_ADMIN_ID";
            throw err;
        }

        try {
            connection = await getConnection();

            // 🔹 Verificar que los usuarios pertenezcan al admin
            const [users] = await connection.query(
                `
            SELECT id_usuario
            FROM Usuario
            WHERE id_usuario IN (?) AND id_admin = ?;
            `,
                [idUsuarios, id_admin]
            );

            if (users.length !== idUsuarios.length) {
                const err = new Error("Usuarios inválidos o no pertenecen al administrador");
                err.code = "INVALID_USERS";
                throw err;
            }

            // 🔹 Solo eliminamos usuarios
            await connection.query(
                `
            DELETE FROM Usuario
            WHERE id_usuario IN (?);
            `,
                [idUsuarios]
            );

            return true;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

}