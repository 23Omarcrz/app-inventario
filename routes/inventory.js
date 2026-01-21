import { Router } from "express";
import { InventoryController } from "../controllers/inventory.js";

export const createInventoryRouter = ({ inventoryModel }) => {
    const inventoryRouter = Router();
    const inventoryController = new InventoryController({ inventoryModel });

    // 1. Obtener categorías de un usuario
    inventoryRouter.get('/usuario/:id_usuario/categorias', inventoryController.getCategorias);
    // 2. Obtener artículos de la categoría seleccionada de ese usuario
    inventoryRouter.get('/usuario/categoria/articulos', inventoryController.getArticulos);
    //obtener todos los articulos
    inventoryRouter.get('/usuario/getAll/articulos', inventoryController.getAllArticulos);
    //insertar articulo
    inventoryRouter.post('/usuario/categoria/articulo/agregar', inventoryController.insertArticulo);
    //eliminar articulo 
    inventoryRouter.delete('/usuario/categoria/delete/articulo/:id_articulo', inventoryController.deleteArticle);
    //actualizar articulo
    inventoryRouter.patch('/usuario/categoria/update/articulo/:id_articulo', inventoryController.updateArticle)
    //importar un archivo
    inventoryRouter.post('/usuario/categoria/import/articulos', inventoryController.fileImport);
    // agregar una nueva categoria
    inventoryRouter.post('/usuario/categoria/agregar', inventoryController.createCategoria);
    // eliminar una categoria
    inventoryRouter.post('/usuario/delete/categoria/:id_categoria', inventoryController.deleteCategory);
    //resumen 
    inventoryRouter.get('/usuario/:id_usuario/reporte', inventoryController.getReporteArticulos)

    return inventoryRouter;
}