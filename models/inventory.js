import { getConnection } from "./connection.js";

export class InventoryModel {
    static async getCategorias({ id_usuario }) {
        let connection;

        try {
            connection = await getConnection();
            const [categorias] = await connection.query(
                'SELECT * FROM Categoria WHERE id_usuario = ?;', [id_usuario]
            );
            return categorias;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
        }
    }
    
    static async getArticulos({ id_usuario, id_categoria, page, limit }) {
        let connection;

        try {
            connection = await getConnection();

            const offset = (page - 1) * limit;

            // 1️⃣ CONTAR ARTÍCULOS
            const [[countResult]] = await connection.query(
                `SELECT COUNT(*) AS total FROM Articulo a JOIN Categoria c ON a.id_categoria = c.id_categoria WHERE c.id_usuario = ? AND c.id_categoria = ?;`,
                [id_usuario, id_categoria]
            );

            const totalItems = countResult.total;
            const totalPages = Math.ceil(totalItems / limit);

            // 2️⃣ TRAER ARTÍCULOS PAGINADOS
            const [items] = await connection.query(
                `
                SELECT
                a.id_articulo,
                a.no_inventario,
                a.no_serie,
                DATE_FORMAT(a.fecha_adquisicion, '%d-%m-%Y') AS fecha_adquisicion,
                a.valor,
                a.descripcion,
                a.marca,
                a.fabricante,
                a.resguardatario,
                DATE_FORMAT(a.fecha_asignacion, '%d-%m-%Y') AS fecha_asignacion,
                a.observaciones,
                a.ubicacion,
                a.no_interno_DCC,
                DATE_FORMAT(a.fecha_ultima_revision, '%d-%m-%Y') AS fecha_ultima_revision,
                a.no_oficio_traspaso,
                a.id_categoria,
                a.id_estatus,
                CONCAT(u.nombre, ' ', u.apellidos) AS usuario,
                e.nombre AS estatus
            FROM Articulo a
            JOIN Categoria c ON a.id_categoria = c.id_categoria
            JOIN Usuario u ON c.id_usuario = u.id_usuario
            LEFT JOIN Estatus e ON a.id_estatus = e.id_estatus
            WHERE c.id_usuario = ?
                AND c.id_categoria = ?
            ORDER BY a.id_articulo DESC
            LIMIT ? OFFSET ?;
                `,
                [id_usuario, id_categoria, limit, offset]
            );

            // 3️⃣ DEVOLVER TODO JUNTO
            return {
                items,
                totalItems,
                totalPages,
                page,
                limit
            };

        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async insertArticulo({ input }) {
        let connection;

        try {
            connection = await getConnection();
            let id_estatus = null;

            if (input.estatus) {
                const [rows] = await connection.query(
                    'SELECT id_estatus FROM Estatus WHERE nombre = ?',
                    [input.estatus]
                );

                if (rows.length > 0) {
                    id_estatus = rows[0].id_estatus;
                    input = {
                        ...input,
                        id_estatus
                    }
                    delete input.estatus;
                    console.log(input);
                } else {
                    // Opcional: lanzar error si el estatus no existe
                    const err = new Error(`Estatus "${input.estatus}" no encontrado`)
                    err.code = "ESTATUS_NOT_FOUND"
                    throw err;
                }
            }

            // Obtenemos solo los campos que tienen valor
            const fields = Object.keys(input); // ['nombre', 'descripcion', 'valor']
            const values = Object.values(input); // ['Producto A', 'Algo', 123.45]

            // Armamos placeholders
            const placeholders = fields.map(() => "?").join(", "); // "?, ?, ?"

            // Ejecutamos
            await connection.query(
                `INSERT INTO Articulo (${fields.join(", ")}) VALUES (${placeholders});`, values);
            
            return true;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async deleteArticulo({ id_articulo }) {
        let connection;    
        try {
            connection = await getConnection();
        
            const [result] = await connection.query(
                `DELETE FROM Articulo WHERE id_articulo = ?;`, [id_articulo]
            )
        
            if (result.affectedRows === 0) {
                const err = new Error(`Articulo no encontrado`)
                err.code = "ARTICLE_NOT_FOUND"
                throw err;
            }
        
            return true;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
        }
    }

    static async createCategoria({ input }) {
        const {id_usuario, nombre_categoria} = input;

        let connection;
        try {
            connection = await getConnection();
            await connection.query(
                `INSERT INTO Categoria (nombre, id_usuario)
             VALUES (?, ?);`, [nombre_categoria, id_usuario]
            );
            return { success: true };
        } catch (error) {
            throw error
        } finally {
            if (connection) connection.release();
        }
    }

    static async fileImport({ input }) {
        const preparedArticles = [];
        const errors = [];
        let connection;
        
        try {
            connection = await getConnection();
            for (const articulo of input) {
                const articuloErrors = []; // errores solo de este artículo


                // Validar categoría
                const [categoria] = await connection.query(
                    "SELECT id_categoria FROM Categoria WHERE id_categoria = ?",
                    [articulo.id_categoria]
                );

                if (!categoria.length) {
                    articuloErrors.push(`Categoría inválida para artículo: ${articulo.no_inventario}`);
                }

                // Convertir estatus texto → id
                const [estatusRow] = await connection.query(
                    "SELECT id_estatus FROM Estatus WHERE nombre = ?",
                    [articulo.estatus]
                );

                if (!estatusRow.length) {
                    articuloErrors.push(`Estatus inválido para artículo: ${articulo.no_inventario}`);
                }

                if (articuloErrors.length > 0) {
                    errors.push({ no_inventario: articulo.no_inventario, articleErrors: articuloErrors });
                } else {
                    // Construir objeto listo para insertar
                    delete articulo.estatus;
                    preparedArticles.push({
                        ...articulo,
                        id_estatus: estatusRow[0].id_estatus
                    });
                }
            }
            // Si hay errores, puedes devolverlos todos juntos
            if (errors.length > 0) {
                const err = new Error(`Error. Inconsistencia de datos`)
                err.code = "INCONSITENT_DATA"
                err.errors = errors
                throw err;
            }

            const numeros_de_serie = preparedArticles.map((item) => item.no_serie)
            const placeholders = numeros_de_serie.map(() => '?').join(', ');

            const [duplicados] = await connection.query(
                `SELECT no_serie FROM Articulo WHERE no_serie IN (${placeholders});`, numeros_de_serie);

            if(duplicados.length > 0){
                const err = new Error("Registros duplicados");
                err.code = "ER_DUP_ENTRY"
                err.duplicated = duplicados
                throw err;
            }

            const columnas = [
                "no_inventario", 
                "no_serie", 
                "fecha_adquisicion",
                "valor",
                "descripcion",
                "marca",
                "fabricante",
                "resguardatario",
                "fecha_asignacion",
                "observaciones",
                "ubicacion",
                "no_interno_DCC",
                "fecha_ultima_revision",
                "no_oficio_traspaso",
                "id_categoria",
                "id_estatus",
            ];

            const items = preparedArticles.map((articulo) => {
                return columnas.map(col => articulo[col] ?? null)
            })

            await connection.query(
                `INSERT INTO Articulo (${columnas.join(", ")}) VALUES ?;`, [items]);
            
            //console.log(items);
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
        }
    }
}


