import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: '192.168.3.51',
    user: 'admin',
    port: 3306,
    password: 'MysqL!230902',
    database: 'inventario_db'
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