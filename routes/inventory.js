import { Router } from "express";
import { InventoryController } from "../controllers/inventory.js";

export const createInventoryRouter = ({ inventoryModel }) => {
    const inventoryRouter = Router();
    const inventoryController = new InventoryController({ inventoryModel });

    // 1. Obtener categorías de un usuario
    inventoryRouter.get('/usuario/:id_usuario/categorias', inventoryController.getCategorias);
    // 2. Obtener artículos de la categoría seleccionada de ese usuario
    inventoryRouter.get('/usuarios/:id_usuario/categorias/:id_categoria/articulos', inventoryController.getArticulos);

    return inventoryRouter;
}