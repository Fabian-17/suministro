import { Router } from "express";
import { actualizarSalidaController, crearSalidaController, obtenerSalidaPorArticuloController, obtenerSalidaPorFechaController, obtenerSalidasController, uploadExcelSalidasController, eliminarSalidaController } from "../controllers/salida.controller.js";
import multer from "multer";

const upload = multer();
const SalidaRoute = Router();

SalidaRoute.post("/", crearSalidaController);
SalidaRoute.put("/:id", actualizarSalidaController);
SalidaRoute.delete("/:id", eliminarSalidaController);
SalidaRoute.get("/:articulo", obtenerSalidaPorArticuloController);
SalidaRoute.get("/:fecha", obtenerSalidaPorFechaController);
SalidaRoute.get("/", obtenerSalidasController);
SalidaRoute.post("/upload", upload.single("file"), uploadExcelSalidasController);

export default SalidaRoute;