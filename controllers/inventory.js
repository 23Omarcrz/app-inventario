import { validateCategory } from "../schemas/validCategory.js";
import { validateArticulosArray } from "../schemas/validImport.js";
import { validateArticle } from "../schemas/validAddArticle.js";
import { validateEditArticle } from "../schemas/validEditArticle.js";

export class InventoryController {
    constructor({ inventoryModel }) {
        this.inventoryModel = inventoryModel;
    }

    getCategorias = async (req, res) => {
        try {
            const { id_usuario } = req.params;
            const id_admin = req.session.id_admin;

            const categorias = await this.inventoryModel.getCategorias({ id_admin, id_usuario });

            return res.status(200).json({
                success: true,
                message: "categorías filtradas",
                categorias
            });
        } catch (error) {
            if (error.code === "INVALID_ADMIN_ID") {
                return res.status(400).json({
                    success: false,
                    code: "INVALID_ADMIN_ID",
                    message: "Administrador no válido"
                });
            }

            if (error.code === "INVALID_USER_ID") {
                return res.status(400).json({
                    success: false,
                    code: "INVALID_USER_ID",
                    message: "Usuario no válido"
                });
            }

            if (error.code === "INVALID_USER_ADMIN") {
                return res.status(403).json({
                    success: false,
                    code: "INVALID_USER_ADMIN",
                    message: "El usuario no pertenece a este administrador"
                });
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Error interno del servidor, intenta más tarde" });
        }
        
    }

    getArticulos = async (req, res) => {
        // 🔹 DATOS QUE MANDA EL FRONT (query params)
        const {
            id_usuario,
            id_categoria,
            page,
            limit,
            search
        } = req.query;
        const id_admin = req.session.id_admin;

        // 🔸 Normalizar números
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return res.status(400).json({
                success: false,
                code: "INVALID_PAGE",
                message: "Número de página no válido"
            });
        }

        if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 30) {
            return res.status(400).json({
                success: false,
                code: "INVALID_LIMIT",
                message: "Límite no válido"
            });
        }

        let cleanSearch = null;

        if (typeof search === "string") {
            const trimmed = search.trim();
            if (trimmed.length > 0 && trimmed.length <= 50) {
                cleanSearch = trimmed;
            }
        }

        try {
            // 🔹 LLAMADA AL MODELO
            const result = await this.inventoryModel.getArticulos({id_admin, id_usuario, id_categoria, page: pageNumber, limit: limitNumber, search: cleanSearch});

            //console.log(result.items);
            // 🔹 RESPUESTA AL FRONT
            return res.status(200).json({
                success: true,
                message: "Artículos encontrados",
                items: result.items,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
                page: result.page,
                limit: result.limit
            });

        } catch (error) {
            if(error.code) {
                if (error.code === "INVALID_ADMIN_ID") {
                    return res.status(401).json({
                        success: false,
                        code: "INVALID_ADMIN_ID",
                        message: "Administrador no válido"
                    });
                }
                if (error.code === "INVALID_USER_ID") {
                    return res.status(400).json({
                        success: false,
                        code: "INVALID_USER_ID",
                        message: "Usuario no válido"
                    });
                }

                if (error.code === "INVALID_CATEGORY_ID") {
                    return res.status(400).json({
                        success: false,
                        code: "INVALID_CATEGORY_ID",
                        message: "Categoría no válida"
                    });
                }

                if (error.code === "INVALID_USER_ADMIN") {
                    return res.status(403).json({
                        success: false,
                        code: "INVALID_USER_ADMIN",
                        message: "El usuario no pertenece a este administrador"
                    });
                }

                if (error.code === "INVALID_CATEGORY_USER") {
                    return res.status(403).json({
                        success: false,
                        code: "INVALID_CATEGORY_USER",
                        message: "La categoría no pertenece al usuario"
                    });
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Error interno del servidor, intenta más tarde" });
        }
    }

    getAllArticulos = async (req, res) => {
        // 🔹 DATOS QUE MANDA EL FRONT (query params)
        const {
            id_usuario,
            page,
            limit,
            search
        } = req.query;
        const id_admin = req.session.id_admin;

        // 🔸 Normalizar números
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return res.status(400).json({
                success: false,
                code: "INVALID_PAGE",
                message: "Número de página no válido"
            });
        }

        if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 30) {
            return res.status(400).json({
                success: false,
                code: "INVALID_LIMIT",
                message: "Límite no válido"
            });
        }

        let cleanSearch = null;
        if (typeof search === "string") {
            const trimmed = search.trim();
            if (trimmed.length > 0 && trimmed.length <= 50) {
                cleanSearch = trimmed;
            }
        }

        try {
            // 🔹 LLAMADA AL MODELO
            const result = await this.inventoryModel.getAllArticulos({ id_admin, id_usuario, page: pageNumber, limit: limitNumber, search: cleanSearch });

            //console.log(result.items);
            // 🔹 RESPUESTA AL FRONT
            return res.status(200).json({
                success: true,
                message: "Artículos encontrados",
                items: result.items,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
                page: result.page,
                limit: result.limit
            });

        } catch (error) {
            if (error.code === "INVALID_USER_ID") {
                return res.status(400).json({
                    success: false,
                    code: "INVALID_USER_ID",
                    message: "Usuario no válido"
                });
            }

            if (error.code === "INVALID_USER_ADMIN") {
                return res.status(403).json({
                    success: false,
                    code: "INVALID_USER_ADMIN",
                    message: "El usuario no pertenece a este administrador"
                });
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Error interno del servidor, intenta más tarde" });
        }
    }
    
    insertArticulo = async (req, res) => {
        const result = validateArticle(req.body);
        if (result.error) {
            // Parseamos el error de Zod
            //console.log(result.error.message)
            const parsedError = JSON.parse(result.error.message);

            // Iteramos sobre los errores para agregar el valor ingresado por el usuario
            const formattedErrors = parsedError.map((err) => {
                // Obtenemos el valor que el usuario ingresó para el campo específico
                const userValue = req.body[err.path[0]];  // `err.path[0]` es el campo que causó el error

                // Modificamos el mensaje para incluir el valor ingresado
                return {
                    ...err,
                    userValue: userValue  // Añadimos el valor ingresado por el usuario al error
                };
            });
            // Devolvemos los errores con el valor ingresado
            return res.status(400).json({ error: formattedErrors });
        }

        const datos = Object.fromEntries(
            Object.entries(result.data).filter(([_, value]) => value !== "" && value !== undefined)
        );
        
        try {
            const crear = await this.inventoryModel.insertArticulo({input: datos});
            return res.status(201).json({
                success: crear,
                message: "Artículo agregado"
            })
        } catch (error) {
            if(error.code){
                if (error.code === "INVALID_CATEGORY_ID") {
                    return res.status(400).json({
                        success: false,
                        code: "INVALID_CATEGORY_ID",
                        error: [{
                            path: ["categoria"],
                            message: "Selecciona una categoría válida"
                        }]
                    });
                }

                if (error.code === "CATEGORY_NOT_FOUND") {
                    return res.status(404).json({
                        success: false,
                        code: "CATEGORY_NOT_FOUND",
                        error: [{
                            path: ["categoria"],
                            message: "Selecciona una categoría válida"
                        }]
                    });
                }

                if (error.code === "ER_DUP_ENTRY") {
                    if (error.message.includes("no_inventario")) {
                        return res.status(409).json({
                            success: false,
                            code: "DUPLICATE_ARTICLE",
                            error: [{
                                path: ["no_inventario"],
                                message: "No_inventario duplicado"
                            }]
                        });
                    }

                    if (error.message.includes("no_serie")) {
                        return res.status(409).json({
                            success: false,
                            code: "DUPLICATE_ARTICLE",
                            error: [{
                                path: ["no_serie"],
                                message: "No_serie duplicado"
                            }]
                        });
                    }
                }
                if (error.code === "ESTATUS_NOT_FOUND") {
                    return res.status(404).json({ 
                        success: false, 
                        code: "STATUS_NOT_FOUND", 
                        error: [{
                            path: ["estatus"],
                            message: "Estatus no valido"
                        }]
                    });
                }
            }
            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Error interno del servidor, intenta más tarde" });
        }
    }

    updateArticle = async (req, res) => {
        const result = validateEditArticle(req.body);
        if (result.error) {
            // Parseamos el error de Zod
            //console.log(result.error.message)
            const parsedError = JSON.parse(result.error.message);

            // Iteramos sobre los errores para agregar el valor ingresado por el usuario
            const formattedErrors = parsedError.map((err) => {
                // Obtenemos el valor que el usuario ingresó para el campo específico
                const userValue = req.body[err.path[0]];  // `err.path[0]` es el campo que causó el error

                // Modificamos el mensaje para incluir el valor ingresado
                return {
                    ...err,
                    userValue: userValue  // Añadimos el valor ingresado por el usuario al error
                };
            });
            // Devolvemos los errores con el valor ingresado
            return res.status(400).json({ error: formattedErrors });
        }

        const datos = Object.fromEntries(
            Object.entries(result.data).filter(([_, value]) => value !== "" && value !== undefined)
        );

        // ---- ID desde params ----
        const id_articulo = Number(req.params.id_articulo);

        if (!Number.isInteger(id_articulo) || id_articulo <= 0) {
            return res.status(400).json({
                success: false,
                error: [{
                    path: ["id_articulo"],
                    message: "ID de artículo no válido"
                }]
            });
        }

        // ---- Agregamos el ID ----
        datos.id_articulo = id_articulo;

        try {
            const actualizar = await this.inventoryModel.updateArticle({ input: datos });
            return res.status(204).json({
                success: true,
                message: "Datos actualizados"
            })
        } catch (error) {
            if (error.code) {
                if (error.code === "ESTATUS_NOT_FOUND") {
                    return res.status(404).json({ 
                        success: false, 
                        code: "STATUS_NOT_FOUND",
                        error: [{
                            path: ["estatus"],
                            message: "Estatus no valido"
                        }] 
                    });
                }
                if (error.code === "ARTICLE_NOT_FOUND") {
                    return res.status(404).json({ 
                        success: false, 
                        code: "ARTICLE_NOT_FOUND", 
                        error: [{
                            path: ["artículo"],
                            message: "Artículo no encontrado"
                        }]
                    });
                }
                if (error.code === "NO_DATA_TO_UPDATE") {
                    return res.status(404).json({
                        success: false,
                        code: "NO_DATA_TO_UPDATE",
                        error: [{
                            path: ["Sin datos"],
                            message: "No hay campos para actualizar"
                        }]
                    });
                }
                if (error.code === "ER_DUP_ENTRY") {
                    if (error.message.includes("no_inventario")) {
                        return res.status(409).json({
                            success: false,
                            code: "DUPLICATE_ARTICLE",
                            error: [{
                                path: ["no_inventario"],
                                message: "No_inventario duplicado"
                            }]
                        });
                    }
                }
            }
            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Error interno del servidor, intenta más tarde" });
        }
    }

    deleteArticle = async (req, res) => {
        const id_articulo = Number(req.params.id_articulo);
        if (!Number.isInteger(id_articulo) || id_articulo <= 0) {
            return res.status(400).json({
                success: false,
                error: [{
                    path: ["id_articulo"],
                    message: "Artículo no válido"
                }]
            });
        }

        try {
            const result = await this.inventoryModel.deleteArticulo({ id_articulo });

            return res.status(204).json({
                success: result,
                message: 'Artículo eliminado'
            })
        } catch (error) {
            if (error.code) {
                if (error.code === "ARTICLE_NOT_FOUND") {
                    return res.status(404).json({ 
                        success: false, 
                        code: "ARTICLE_NOT_FOUND", 
                        error: [{
                            path: ["artículo"],
                            message: "El artículo no existe" 
                        }]
                    });
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Error interno del servidor, intenta más tarde" });
        }
    }

    createCategoria = async (req, res) => {
        const result = validateCategory(req.body);

        if (result.error) {
            // Parseamos el error de Zod
            //console.log(result.error.message)
            const parsedError = JSON.parse(result.error.message);

            // Iteramos sobre los errores para agregar el valor ingresado por el usuario
            const formattedErrors = parsedError.map((err) => {
                // Obtenemos el valor que el usuario ingresó para el campo específico
                const userValue = req.body[err.path[0]];  // `err.path[0]` es el campo que causó el error

                // Modificamos el mensaje para incluir el valor ingresado
                return {
                    ...err,
                    userValue: userValue  // Añadimos el valor ingresado por el usuario al error
                };
            });

            // Imprimimos los errores con el valor ingresado para enviar al frontend
            //console.log("Error que se enviará al front:", formattedErrors);

            // Devolvemos los errores con el valor ingresado
            return res.status(400).json({ error: formattedErrors });
        }

        try {
            const category = await this.inventoryModel.createCategoria({input: result.data});
            return res.status(201).json({
                success: true,
                message: "Categoría agregada",
                newCategory: category
            });
        } catch (error) {
            if (error.code) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, code: "DUPLICATE_CATEGORY", message: 'La categoría ya existe' });
                }
            }
            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: 'Error interno del servidor, intenta más tarde' });
        }
    }

    fileImport = async (req, res) => {
        //console.log(req.body);
        const result = validateArticulosArray(req.body);

        if(result.errors.length > 0){
            return res.status(400).json(result.errors);
        }

        const cleanedArray = (arreglo) => {
            return arreglo.map((obj) => {
                return Object.fromEntries(
                    Object.entries(obj).filter(([_, value]) => value !== "" && value !== undefined)
                );
            });
        }

        const datos = cleanedArray(result.data)
        try {
            const importar = await this.inventoryModel.fileImport({input: datos});
            return res.status(201).json({
                success: true,
                message: "Archivo importado correctamente"
            })
        } catch (error) {
            if (error.code) {
                if (error.code === "DATA_INCONSISTENCY") {
                    return res.status(400).json({ success: false, code: "DATA_INCONSISTENCY", message: "Existen inconsistencias en los datos enviados", error: error.errors });
                }

                if(error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ success: false, code: "DUPLICATE_RECORDS", message: "Registros duplicados", error: error.duplicated });    
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Error interno del servidor, intenta más tarde" });
        }
    }

    deleteCategory = async (req, res) => {
        const id_categoria = Number(req.params.id_categoria);

        if (!Number.isInteger(id_categoria) || id_categoria <= 0) {
            return res.status(400).json({
                success: false,
                message: "Categoría no válida"
            });
        }
        
        try {
            await this.inventoryModel.deleteCategory({ id_categoria });

            return res.status(200).json({
                success: true,
                message: 'Categoría eliminada',
                deletedCategory: id_categoria
            })
        } catch (error) {
            if (error.code) {
                if (error.code === "CATEGORY_NOT_FOUND") {
                    return res.status(404).json({ success: false, code: "CATEGORY_NOT_FOUND", message: "La categoría no existe" });
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Error interno del servidor, intenta más tarde" });
        }
    }

    getReporteArticulos = async (req, res) => {
        try {
            const { id_usuario } = req.params;
            
            const idUsuario = Number(id_usuario);

            if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Usuario no válido"
                });
            }


            let { id_categoria } = req.query;
            if (
                id_categoria === undefined ||
                id_categoria === null ||
                id_categoria === "null" ||
                id_categoria === ""
            ) {
                id_categoria = null;
            } else {
                id_categoria = Number(id_categoria);

                if (!Number.isInteger(id_categoria) || id_categoria <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Categoría no válida"
                    });
                }
            }
            const report = await this.inventoryModel.getReporteArticulos({ id_usuario: idUsuario, id_categoria });

            return res.status(200).json({
                success: true,
                message: "resumen del usuario",
                report
            });
        } catch (error) {
            if(error.code){
                if (error.code === "USER_NOT_FOUND") {
                    return res.status(404).json({
                        success: false,
                        code: "USER_NOT_FOUND",
                        message: "El usuario no existe"
                    });
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Error interno del servidor, intenta más tarde" });
        }
    }
}