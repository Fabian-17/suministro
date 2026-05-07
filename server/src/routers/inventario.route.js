import { Router } from "express";
import { crearInventarioController, eliminarInventarioController, obtenerInventarioPorArticuloController, obtenerInventariosController, updateInventario, uploadExcelInventarioController, importRegistro, buscarInventariosController } from "../controllers/inventario.controller.js";
import { verificarToken, soloEncargados } from '../middlewares/auth.js';

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const InventarioRoute = Router();

// Rutas de solo lectura - todos los autenticados
InventarioRoute.get("/search", verificarToken, buscarInventariosController);
InventarioRoute.get("/:articulo", verificarToken, obtenerInventarioPorArticuloController);
InventarioRoute.get("/", verificarToken, obtenerInventariosController);

// Rutas de escritura - solo encargados y admin
InventarioRoute.post("/", verificarToken, soloEncargados, crearInventarioController);
InventarioRoute.post("/upload", verificarToken, soloEncargados, upload.single('file'), uploadExcelInventarioController);
InventarioRoute.delete("/:id", verificarToken, soloEncargados, eliminarInventarioController);
InventarioRoute.put("/:id", verificarToken, soloEncargados, updateInventario);
InventarioRoute.post("/import-registro", verificarToken, soloEncargados, upload.single("file"), importRegistro);
export default InventarioRoute;