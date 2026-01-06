import mysql from 'mysql2/promise'
import 'dotenv/config'

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: process.env.MYSQL_PORT,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_NAME
});

export async function getConnection() {
    try {
        return await pool.getConnection();
    } catch (e) {
        const err = new Error("No se pudo conectar a la base de datos");
        err.code = "DB_CONNECTION_ERROR";
        throw err;
    }
}