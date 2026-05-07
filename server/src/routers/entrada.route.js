import { Router } from "express";
import { crearEntradaController, editarEntradaController, obtenerEntradasController } from "../controllers/entrada.controller.js";
import { verificarToken, soloEncargados } from '../middlewares/auth.js';
import multer from 'multer';
import { uploadExcelEntradasController } from '../controllers/entrada.controller.js';
const upload = multer({ storage: multer.memoryStorage() });

const EntradaRoute = Router();

// Solo encargados y admin pueden gestionar entradas
EntradaRoute.post("/", verificarToken, soloEncargados, crearEntradaController);
EntradaRoute.put("/:id", verificarToken, soloEncargados, editarEntradaController);
EntradaRoute.get("/", verificarToken, soloEncargados, obtenerEntradasController);
EntradaRoute.post("/upload", verificarToken, soloEncargados, upload.single('file'), uploadExcelEntradasController);

export default EntradaRoute;