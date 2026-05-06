import { Router } from 'express';
import {
    crearSolicitudController,
    obtenerSolicitudesController,
    obtenerSolicitudController,
    obtenerMisSolicitudesController,
    obtenerSolicitudesPendientesController,
    obtenerSolicitudesAprobadasController,
    aprobarSolicitudController,
    rechazarSolicitudController,
    procesarSolicitudController,
    eliminarSolicitudController
} from '../controllers/solicitudes.controller.js';
import { verificarToken, soloEncargados } from '../middlewares/auth.js';

const router = Router();

/**
 * Rutas de solicitudes
 * Base: /solicitudes
 * Todas las rutas requieren autenticación
 */

// Aplicar autenticación a todas las rutas
router.use(verificarToken);

// === Rutas para SOLICITANTES ===

// POST /solicitudes - Crear nueva solicitud (todos los roles)
router.post('/', crearSolicitudController);

// GET /solicitudes/mis-solicitudes - Ver mis propias solicitudes (todos los roles)
router.get('/mis-solicitudes', obtenerMisSolicitudesController);

// === Rutas para ENCARGADOS y ADMINS ===

// GET /solicitudes/pendientes - Ver solicitudes pendientes
router.get('/pendientes', soloEncargados, obtenerSolicitudesPendientesController);

// GET /solicitudes/aprobadas - Ver solicitudes aprobadas (listas para procesar)
router.get('/aprobadas', soloEncargados, obtenerSolicitudesAprobadasController);

// GET /solicitudes - Ver todas las solicitudes
router.get('/', soloEncargados, obtenerSolicitudesController);

// GET /solicitudes/:id - Ver detalle de solicitud
router.get('/:id', obtenerSolicitudController);

// PUT /solicitudes/:id/aprobar - Aprobar solicitud
router.put('/:id/aprobar', soloEncargados, aprobarSolicitudController);

// PUT /solicitudes/:id/rechazar - Rechazar solicitud
router.put('/:id/rechazar', soloEncargados, rechazarSolicitudController);

// POST /solicitudes/:id/procesar - Procesar solicitud (generar salidas)
router.post('/:id/procesar', soloEncargados, procesarSolicitudController);

// DELETE /solicitudes/:id - Eliminar solicitud
router.delete('/:id', eliminarSolicitudController);

export default router;
