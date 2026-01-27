import { getConnection } from "./connection.js";

export class InventoryModel {
    static async getCategorias({ id_admin, id_usuario }) {
        let connection;

        if (!Number.isInteger(Number(id_usuario))) {
            const err = new Error("id_usuario no válido");
            err.code = "INVALID_USER_ID";
            throw err;
        }

        if (!Number.isInteger(id_admin)) {
            const err = new Error("id_admin no válido");
            err.code = "INVALID_ADMIN_ID";
            throw err;
        }

        try {
            connection = await getConnection();

            // 🔹 Verificamos que el usuario pertenezca al admin
            const [user] = await connection.query(
                `
            SELECT id_usuario
            FROM Usuario
            WHERE id_usuario = ? AND id_admin = ?;
            `,
                [id_usuario, id_admin]
            );

            if (user.length === 0) {
                const err = new Error("Usuario no pertenece al admin");
                err.code = "INVALID_USER_ADMIN";
                throw err;
            }

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
    
    static async getArticulos({ id_admin, id_usuario, id_categoria, page, limit, search }) {
        let connection;

        if (!Number.isInteger(id_admin)) {
            const err = new Error("id_admin no válido");
            err.code = "INVALID_ADMIN_ID";
            throw err;
        }

        if (!Number.isInteger(Number(id_usuario))) {
            const err = new Error("id_usuario no válido");
            err.code = "INVALID_USER_ID";
            throw err;
        }

        if (!Number.isInteger(Number(id_categoria))) {
            const err = new Error("id_categoria no válida");
            err.code = "INVALID_CATEGORY_ID";
            throw err;
        }

        try {
            connection = await getConnection();

            const [user] = await connection.query(
                `
            SELECT id_usuario
            FROM Usuario
            WHERE id_usuario = ? AND id_admin = ?;
            `,
                [id_usuario, id_admin]
            );

            if (user.length === 0) {
                const err = new Error("Usuario no pertenece al admin");
                err.code = "INVALID_USER_ADMIN";
                throw err;
            }

            const [categoria] = await connection.query(
                `
            SELECT id_categoria
            FROM Categoria
            WHERE id_categoria = ? AND id_usuario = ?;
            `,
                [id_categoria, id_usuario]
            );

            if (categoria.length === 0) {
                const err = new Error("Categoría no pertenece al usuario");
                err.code = "INVALID_CATEGORY_USER";
                throw err;
            }

            const safePage = Math.max(page, 1);
            const safeLimit = Math.min(Math.max(limit, 1), 30);
            const offset = (safePage - 1) * safeLimit;

            let where = `
                WHERE c.id_usuario = ?
                AND c.id_categoria = ?
            `;

            const params = [id_usuario, id_categoria];

            if (search) {
                where += `
                    AND (
                        a.no_inventario LIKE ?
                        OR a.no_serie LIKE ?
                    )
                `;
                const likeSearch = `%${search}%`;
                params.push(
                    likeSearch,
                    likeSearch
                );
            }

            // 1️⃣ CONTAR ARTÍCULOS
            const [[countResult]] = await connection.query(
                `SELECT COUNT(*) AS total 
                FROM Articulo a 
                JOIN Categoria c ON a.id_categoria = c.id_categoria 
                ${where};`, params
            );

            const totalItems = countResult.total;
            const totalPages = Math.ceil(totalItems / safeLimit);

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
            ${where}
            ORDER BY a.id_articulo DESC
            LIMIT ? OFFSET ?;
                `,
                [...params, safeLimit, offset]
            );

            // 3️⃣ DEVOLVER TODO JUNTO
            return {
                items,
                totalItems,
                totalPages,
                page: safePage,
                limit: safeLimit
            };

        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async getAllArticulos({ id_admin, id_usuario, page, limit, search }) {
        let connection;

        const userId = Number(id_usuario);

        if (!Number.isInteger(userId) || userId <= 0) {
            const err = new Error("id_usuario no válido");
            err.code = "INVALID_USER_ID";
            throw err;
        }

        try {
            connection = await getConnection();

            // 🔒 Verificar pertenencia usuario-admin
            const [user] = await connection.query(
                `
                SELECT id_usuario
                FROM Usuario
                WHERE id_usuario = ? AND id_admin = ?;
                `,
                [userId, id_admin]
            );

            if (user.length === 0) {
                const err = new Error("Usuario no pertenece al admin");
                err.code = "INVALID_USER_ADMIN";
                throw err;
            }

            const offset = (page - 1) * limit;

            let where = `
            WHERE c.id_usuario = ?
            `;

            const params = [userId];

            // 🔍 BÚSQUEDA
            if (search) {
                where += `
                AND (
                    a.no_inventario LIKE ?
                    OR a.no_serie LIKE ?
                )
            `;
                const likeSearch = `%${search}%`;
                params.push(likeSearch, likeSearch);
            }

            // 1️⃣ CONTAR ARTÍCULOS
            const [[countResult]] = await connection.query(
                `
            SELECT COUNT(*) AS total
            FROM Articulo a
            JOIN Categoria c ON a.id_categoria = c.id_categoria
            ${where};
            `,
                params
            );

            const totalItems = countResult.total;
            const totalPages = Math.ceil(totalItems / limit);

            // 2️⃣ OBTENER ARTÍCULOS (ORDEN POR CATEGORÍA)
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
            ${where}
            ORDER BY a.id_categoria ASC, a.id_articulo DESC
            LIMIT ? OFFSET ?;
            `,
                [...params, limit, offset]
            );

            // 3️⃣ RESPUESTA
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

        const categoriaId = Number(input.id_categoria);

        if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
            const err = new Error("Categoría no válida");
            err.code = "INVALID_CATEGORY_ID";
            throw err;
        }

        try {
            connection = await getConnection();

            const [categoria] = await connection.query(
                `SELECT id_categoria FROM Categoria WHERE id_categoria = ?`,
                [categoriaId]
            );

            if (categoria.length === 0) {
                const err = new Error("Categoría no existe");
                err.code = "CATEGORY_NOT_FOUND";
                throw err;
            }


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
                } else {
                    // Opcional: lanzar error si el estatus no existe
                    const err = new Error(`Estatus "${input.estatus}" no encontrado`)
                    err.code = "STATUS_NOT_FOUND"
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

    static async updateArticle({ input }) {
        let connection;

        try {
            connection = await getConnection();
            const id_articulo = input.id_articulo
            const [articulo] = await connection.query(
                'SELECT id_articulo FROM Articulo WHERE id_articulo = ?',
                [id_articulo]
            );

            if(articulo.length === 0) {
                const err = new Error(`Artículo no encontrado`)
                err.code = "ARTICLE_NOT_FOUND"
                throw err;
            }

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
                } else {
                    // Opcional: lanzar error si el estatus no existe
                    const err = new Error(`Estatus "${input.estatus}" no encontrado`)
                    err.code = "STATUS_NOT_FOUND"
                    throw err;
                }
            }

            // Quitamos el id del objeto de actualización
            delete input.id_articulo;

            // Obtenemos solo los campos que tienen valor
            const fields = Object.keys(input); // ['nombre', 'descripcion', 'valor']
            
            if (fields.length === 0) {
                const err = new Error(`No hay campos para actualizar`)
                err.code = "NO_DATA_TO_UPDATE"
                throw err;
            }

            const values = Object.values(input); // ['Producto A', 'Algo', 123.45]

            // nombre = ?, descripcion = ?, valor = ?
            const setClause = fields.map(field => `${field} = ?`).join(", ");

            // Ejecutamos
            const [result] = await connection.query(
                `UPDATE Articulo SET ${setClause} WHERE id_articulo = ?`,
                [...values, id_articulo]
            );

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
                const err = new Error(`Artículo no encontrado`)
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
            const [result] = await connection.query(
                `INSERT INTO Categoria (nombre, id_usuario)
             VALUES (?, ?);`, [nombre_categoria, id_usuario]
            );

            const newCategoryId = result.insertId;
            
            const [categoria] = await connection.query(
                'SELECT * FROM Categoria WHERE id_categoria = ?;', [newCategoryId]
            );

            return categoria[0];
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

                let id_estatus = null;
                if(articulo.estatus !== undefined) {
                    // Convertir estatus texto → id
                    const [estatusRow] = await connection.query(
                        "SELECT id_estatus FROM Estatus WHERE nombre = ?",
                        [articulo.estatus]
                    );
    
                    if (!estatusRow.length) {
                        articuloErrors.push(`Estatus inválido para artículo: ${articulo.no_inventario}`);
                    } else {
                        id_estatus = estatusRow[0].id_estatus
                    }
                }

                if (articuloErrors.length > 0) {
                    errors.push({ no_inventario: articulo.no_inventario, articleErrors: articuloErrors });
                } else {
                    // Construir objeto listo para insertar
                    delete articulo.estatus;
                    preparedArticles.push({
                        ...articulo,
                        id_estatus
                    });
                }
            }
            // Si hay errores, puedes devolverlos todos juntos
            if (errors.length > 0) {
                const err = new Error(`Error. Inconsistencia de datos`)
                err.code = "DATA_INCONSISTENCY"
                err.errors = errors
                throw err;
            }

            const numeros_de_inventario = preparedArticles.map((item) => item.no_inventario)
            const placeholders = numeros_de_inventario.map(() => '?').join(', ');

            const [duplicados] = await connection.query(
                `SELECT no_inventario FROM Articulo WHERE no_inventario IN (${placeholders});`, numeros_de_inventario);

            const duplicadosSet = new Set(
                duplicados.map(d => d.no_inventario)
            );

            const registrosDuplicados = preparedArticles
                .map((item, index) => {
                    if (duplicadosSet.has(item.no_inventario)) {
                        return {
                            row: index + 2,          // número de fila
                            no_inventario: item.no_inventario
                        };
                    }
                    return null;
                })
                .filter(Boolean); // elimina los null



            if(duplicados.length > 0){
                const err = new Error("Registros duplicados");
                err.code = "ER_DUP_ENTRY"
                err.duplicated = registrosDuplicados
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

    static async deleteCategory ({ id_categoria }) {
        let connection;
        try {
            connection = await getConnection();

            const [result] = await connection.query(
                `DELETE FROM Categoria WHERE id_categoria = ?;`, [id_categoria]
            )

            if (result.affectedRows === 0) {
                const err = new Error(`Categoria no encontrada`)
                err.code = "CATEGORY_NOT_FOUND"
                throw err;
            }

            return true;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release(); // liberamos la conexión al pool
        }
    }

    static async getReporteArticulos({ id_usuario, id_categoria }) {
    let connection;

    try {
        connection = await getConnection();

        // 🔹 Usuario
        const [[usuario]] = await connection.query(
            `SELECT CONCAT(nombre, ' ', apellidos) AS nombre
             FROM Usuario
             WHERE id_usuario = ?;`,
            [id_usuario]
        );

        if (!usuario) {
            const err = new Error("Usuario no encontrado");
            err.code = "USER_NOT_FOUND";
            throw err;
        }


        // 🔹 Filtro opcional por categoría
        let where = `WHERE c.id_usuario = ?`;
        const params = [id_usuario];

        if (id_categoria) {
            where += ` AND c.id_categoria = ?`;
            params.push(id_categoria);
        }

        // 🔹 Traer TODOS los artículos necesarios para el PDF
        const [rows] = await connection.query(
            `
            SELECT
                c.id_categoria,
                c.nombre AS categoria,
                a.no_inventario,
                a.no_serie,
                a.marca,
                a.descripcion,
                a.fabricante,
                a.observaciones,
                a.valor,
                DATE_FORMAT(a.fecha_adquisicion, '%d-%m-%Y') AS fecha_adquisicion,
                DATE_FORMAT(a.fecha_asignacion, '%d-%m-%Y') AS fecha_asignacion,
                a.ubicacion,
                a.resguardatario,
                a.no_interno_DCC,
                DATE_FORMAT(a.fecha_ultima_revision, '%d-%m-%Y') AS fecha_ultima_revision,
                a.no_oficio_traspaso,
                e.nombre AS estatus
            FROM Categoria c
            LEFT JOIN Articulo a ON a.id_categoria = c.id_categoria
            LEFT JOIN Estatus e ON e.id_estatus = a.id_estatus
            ${where}
            ORDER BY c.id_categoria ASC, a.id_articulo ASC;
            `,
            params
        );

        // 🔹 Agrupar por categoría (ideal para el PDF)
        const categorias = {};

        for (const row of rows) {
            if (!categorias[row.id_categoria]) {
                categorias[row.id_categoria] = {
                    categoria: row.categoria,
                    articulos: []
                };
            }

            if (row.no_inventario) {
                categorias[row.id_categoria].articulos.push({
                    no_inventario: row.no_inventario,
                    no_serie: row.no_serie,
                    marca: row.marca,
                    descripcion: row.descripcion,
                    fabricante: row.fabricante,
                    observaciones: row.observaciones,
                    valor: row.valor,
                    fecha_adquisicion: row.fecha_adquisicion,
                    fecha_asignacion: row.fecha_asignacion,
                    ubicacion: row.ubicacion,
                    resguardatario: row.resguardatario,
                    no_interno_DCC: row.no_interno_DCC,
                    fecha_ultima_revision: row.fecha_ultima_revision,
                    no_oficio_traspaso: row.no_oficio_traspaso,
                    estatus: row.estatus
                });
            }
        }

        return {
            usuario: usuario.nombre,
            tipo_reporte: id_categoria ? "POR_CATEGORIA" : "GENERAL",
            categorias: Object.values(categorias)
        };

    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
    }

}


