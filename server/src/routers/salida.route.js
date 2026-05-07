import { Router } from "express";
import { actualizarSalidaController, crearSalidaController, obtenerSalidaPorArticuloController, obtenerSalidaPorFechaController, obtenerSalidasController, uploadExcelSalidasController } from "../controllers/salida.controller.js";
import { verificarToken, soloEncargados } from '../middlewares/auth.js';
import multer from "multer";

const upload = multer();
const SalidaRoute = Router();

// Solo encargados y admin pueden gestionar salidas
// (Las solicitudes procesadas generan salidas automáticamente)
SalidaRoute.post("/", verificarToken, soloEncargados, crearSalidaController);
SalidaRoute.put("/:id", verificarToken, soloEncargados, actualizarSalidaController);
SalidaRoute.get("/:articulo", verificarToken, soloEncargados, obtenerSalidaPorArticuloController);
SalidaRoute.get("/:fecha", verificarToken, soloEncargados, obtenerSalidaPorFechaController);
SalidaRoute.get("/", verificarToken, soloEncargados, obtenerSalidasController);
SalidaRoute.post("/upload", verificarToken, soloEncargados, upload.single("file"), uploadExcelSalidasController);

export default SalidaRoute;