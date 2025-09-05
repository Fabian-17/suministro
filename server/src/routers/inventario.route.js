import { Router } from "express";
import { crearInventarioController, eliminarInventarioController, obtenerInventarioPorArticuloController, obtenerInventariosController, updateInventario, uploadExcelInventarioController } from "../controllers/inventario.controller.js";

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const InventarioRoute = Router();

InventarioRoute.post("/", crearInventarioController);
InventarioRoute.post("/upload", upload.single('file'), uploadExcelInventarioController);
InventarioRoute.delete("/:id", eliminarInventarioController);
InventarioRoute.get("/:articulo", obtenerInventarioPorArticuloController);
InventarioRoute.get("/", obtenerInventariosController);
InventarioRoute.put("/:id", updateInventario);

export default InventarioRoute;