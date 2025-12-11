import { getConnection } from "./connection.js";

export class AdminModel {
    static async getUsers({ id_admin }) {
        let connection;

        try {
            connection = await getConnection();
            const [result] = await connection.query(
                'SELECT id_usuario, nombre, apellidos, area FROM Usuario WHERE id_admin = ?;', [id_admin] 
            ) 

            return result
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
        }
    }
}