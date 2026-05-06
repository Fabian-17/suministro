import { Router } from 'express';
import {
    obtenerNotificacionesNoLeidasController,
    obtenerTodasNotificacionesController,
    contarNotificacionesNoLeidasController,
    marcarComoLeidaController,
    marcarTodasComoLeidasController,
    eliminarNotificacionController
} from '../controllers/notificaciones.controller.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

/**
 * Rutas de notificaciones
 * Base: /notificaciones
 * Todas las rutas requieren autenticación
 */

// Aplicar autenticación a todas las rutas
router.use(verificarToken);

// GET /notificaciones/no-leidas - Obtener notificaciones no leídas
router.get('/no-leidas', obtenerNotificacionesNoLeidasController);

// GET /notificaciones/contador - Contar notificaciones no leídas
router.get('/contador', contarNotificacionesNoLeidasController);

// GET /notificaciones - Obtener todas las notificaciones
router.get('/', obtenerTodasNotificacionesController);

// PUT /notificaciones/leer-todas - Marcar todas como leídas
router.put('/leer-todas', marcarTodasComoLeidasController);

// PUT /notificaciones/:id/leer - Marcar como leída
router.put('/:id/leer', marcarComoLeidaController);

// DELETE /notificaciones/:id - Eliminar notificación
router.delete('/:id', eliminarNotificacionController);

export default router;
