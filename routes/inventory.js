import { Router } from "express";
import { InventoryController } from "../controllers/inventory.js";

export const createInventoryRouter = ({ inventoryModel }) => {
    const inventoryRouter = Router();
    const inventoryController = new InventoryController({ inventoryModel });

    // 1. Obtener categorías de un usuario
    inventoryRouter.get('/usuario/:id_usuario/categorias', inventoryController.getCategorias);
    // 2. Obtener artículos de la categoría seleccionada de ese usuario
    inventoryRouter.get('/usuario/categoria/articulos', inventoryController.getArticulos);
    //insertar articulo
    inventoryRouter.post('/usuario/categoria/articulo/agregar', inventoryController.insertArticulo);
    //importar un archivo
    inventoryRouter.post('/usuario/categoria/import/articulos', inventoryController.fileImport);
    // agregar una nueva categoria
    inventoryRouter.post('/usuario/categoria/agregar', inventoryController.createCategoria);
    //eliminar articulo 
    inventoryRouter.delete('/usuario/categoria/delete/articulo/:id_articulo', inventoryController.deleteArticle);

    return inventoryRouter;
}