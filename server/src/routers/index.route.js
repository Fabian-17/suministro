import { Router } from "express";
import EntradaRoute from "./entrada.route.js";
import SalidaRoute from "./salida.route.js";
import InventarioRoute from "./inventario.route.js";
import EncargadosRoute from "./encargados.route.js";
import AreasRoute from "./areas.route.js";

const router = Router();

router.use("/entradas", EntradaRoute);
router.use("/salidas", SalidaRoute);
router.use("/inventarios", InventarioRoute);
router.use("/encargados", EncargadosRoute);
router.use("/areas", AreasRoute);

export default router;