import { validateCategory } from "../schemas/validCategory.js";
import { validateArticulosArray } from "../schemas/validImport.js";
import { validateArticle } from "../schemas/validAddArticle.js";

export class InventoryController {
    constructor({ inventoryModel }) {
        this.inventoryModel = inventoryModel;
    }

    getCategorias = async (req, res) => {
        try {
            const { id_usuario } = req.params;

            const categorias = await this.inventoryModel.getCategorias({ id_usuario });

            return res.status(200).json({
                success: true,
                message: "categorias filtradas",
                categorias
            });
        } catch (error) {
            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Ocurrió un error interno, intenta más tarde" });
        }
        
    }

    getArticulos = async (req, res) => {
        // 🔹 DATOS QUE MANDA EL FRONT (query params)
        const {
            id_usuario,
            id_categoria,
            page,
            limit
        } = req.query;

        // 🔸 Normalizar números
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        try {
            // 🔹 LLAMADA AL MODELO
            const result = await this.inventoryModel.getArticulos({id_usuario, id_categoria, page: pageNumber, limit: limitNumber});

            //console.log(result.items);
            // 🔹 RESPUESTA AL FRONT
            return res.status(200).json({
                success: true,
                message: "Articulos encontrados",
                items: result.items,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
                page: result.page,
                limit: result.limit
            });

        } catch (error) {
            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Ocurrió un error interno, intenta más tarde" });
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
            const response = await this.inventoryModel.createCategoria({input: result.data});
            return res.status(201).json({
                success: response.success,
                message: "Categoria agregada",
            });
        } catch (error) {
            if (error.code) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, code: "CATEGORY_DUPLICATED", message: 'La Categoria ya existe' });
                }
            }
            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: 'Ocurrió un error interno, intenta más tarde :(' });
        }
    }

    insertArticulo = async (req, res) => {
        console.log(req.body)
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
            console.log(formattedErrors)
            return res.status(400).json({ error: formattedErrors });
        }
        /*
        try {
            const crear = await this.inventoryModel.insertArticulo({input: result.data});
            return res.status(200).json({
                success: crear,
                message: "Articulo agregado"
            })
        } catch (error) {
            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Ocurrió un error interno, intenta más tarde" });
        } */
    }

    fileImport = async (req, res) => {
        //console.log(req.body);
        const result = validateArticulosArray(req.body);

        if(!result.errors.length === 0){
            return res.status(400).json(result.errors);
        }

        try {
            const importar = await this.inventoryModel.fileImport({input: result.validRows});
        } catch (error) {
            if (error.code) {
                if(error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ success: false, code: error.code, message: "Registros duplicados", error: error.duplicated });    
                }
                
                return res.status(404).json({ success: false, code: error.code, message: "error al insertar", error: error.errors });
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Ocurrió un error interno, intenta más tarde" });
        }
    }

    deleteArticle = async (req, res) => {
        const { id_articulo } = req.params
        console.log(id_articulo)
        try {
            const result = await this.inventoryModel.deleteArticulo({ id_articulo });

            return res.status(200).json({
                succes: result,
                message: 'Articulo eliminado' 
            })
        } catch (error) {
            if(error.code) {
                if (error.code === "ARTICLE_NOT_FOUND") {
                    return res.status(404).json({ success: false, code: "ARTICLE_NOT_FOUND", message: "El articulo no existe" });
                }
            }

            console.error(`[${new Date().toISOString()}]`, error);
            return res.status(500).json({ success: false, code: "INTERNAL_SERVER_ERROR", message: "Ocurrió un error interno, intenta más tarde" });
        }
    }
}