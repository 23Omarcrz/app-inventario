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
                //return res.status(401).json({ msg: "Usuario no encontrado" });
                return { valid: false, message: "Usuario o contrasena incorrecta", admin: {} }  //este mensaje lo dejamos asi para no revelar 
                                                                                    //que el usuario existe a un atacante, lo dejamos ambiguo
            }
            const admin = rows[0];//esto es porque rows es un arreglo con el objeto
            const { id_admin, nombre, apellidos} = admin;
            const usernameAdmin = admin.username;
            // Esto le dice a bcrypt:
            // "Compara la contraseña enviada con el hash guardado"
            const validPassword = await bcrypt.compare(password, admin.password);

            if (!validPassword) {
                //return res.status(401).json({ msg: "Contraseña incorrecta" });
                return { valid: false, message: "Usuario o contrasena incorrecta", admin: {} }  //igual aqui lo dejamos ambiguo
            }

            //res.status(200).json({ msg: "Login exitoso", usuario });
            return { valid: true, message: "Login exitoso", admin:{id_admin, nombre, apellidos, usernameAdmin} }

        } catch (error) {
            console.error(error);//esto no llega al usuario
            return { valid: false, message: 'Ocurrió un error interno, intenta más tarde' };
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

            return { success: true, message: 'Administrador registrado' };

        } catch (error) {
            // Si es un error de duplicado (MySQL tiene error code 1062)
            if (error.code === 'ER_DUP_ENTRY') {
                return { success: false, message: 'El administrador o correo ya existe' };
            }

            // Para otros errores, log interno y mensaje genérico
            console.error(error);//esto no llega al usuario
            return { success: false, message: 'Ocurrió un error interno, intenta más tarde' };
        } finally {
            if (connection) connection.release();
        }
    }
}