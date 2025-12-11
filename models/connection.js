import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: '172.16.87.41',
    user: 'admin',
    port: 3306,
    password: 'MysqL!230902',
    database: 'inventario_db'
});

export async function getConnection() {
    try {
        return await pool.getConnection();
    } catch (e) {
        throw new Error("No se pudo conectar a la base de datos. Verifica que esté funcionando correctamente.");
    }
}