import { Router } from "express";
import EntradaRoute from "./entrada.route.js";
import SalidaRoute from "./salida.route.js";
import InventarioRoute from "./inventario.route.js";
import EncargadosRoute from "./encargados.route.js";
import AreasRoute from "./areas.route.js";
import NotaPedidoRoute from "./notaPedido.route.js";
import AuthRoute from "./auth.route.js";
import UsuariosRoute from "./usuarios.route.js";
import SolicitudesRoute from "./solicitudes.route.js";
import NotificacionesRoute from "./notificaciones.route.js";

const router = Router();

// Rutas de autenticación (públicas y autenticadas)
router.use("/auth", AuthRoute);

// Rutas de gestión de usuarios (requieren autenticación)
router.use("/usuarios", UsuariosRoute);

// Rutas de solicitudes (requieren autenticación)
router.use("/solicitudes", SolicitudesRoute);

// Rutas de notificaciones (requieren autenticación)
router.use("/notificaciones", NotificacionesRoute);

// Rutas existentes (pendiente: agregar autenticación a estas rutas)
router.use("/entradas", EntradaRoute);
router.use("/salidas", SalidaRoute);
router.use("/inventarios", InventarioRoute);
router.use("/encargados", EncargadosRoute);
router.use("/areas", AreasRoute);
router.use("/nota-pedido", NotaPedidoRoute);

export default router;