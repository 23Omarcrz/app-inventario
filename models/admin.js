import { getConnection } from "./connection.js";

export class AdminModel {
    static async getUsers({ id_admin }) {
        let connection;

        try {
            connection = await getConnection();
            const [users] = await connection.query(
                'SELECT id_usuario, nombre, apellidos, area FROM Usuario WHERE id_admin = ?;', [id_admin] 
            ) 
            if (users.length === 0) {
                const err = new Error("No se encontraron usuarios")
                err.code = "USERS_NOT_FOUND"
                throw err;
            }
            
            return users
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
        }
    }

    static async verifyUser({id_usuario, id_admin}) {
        let connection;

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
            return {success: true};
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
        }
    }
}