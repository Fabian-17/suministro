import {
    obtenerNotificacionesNoLeidas,
    obtenerTodasNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    contarNotificacionesNoLeidas
} from '../services/notificacion.service.js';

/**
 * Controlador: Obtener notificaciones no leídas
 * GET /notificaciones/no-leidas
 */
export const obtenerNotificacionesNoLeidasController = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const notificaciones = await obtenerNotificacionesNoLeidas(usuarioId);

        return res.status(200).json(notificaciones);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};

/**
 * Controlador: Obtener todas las notificaciones
 * GET /notificaciones
 */
export const obtenerTodasNotificacionesController = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const limite = req.query.limite ? parseInt(req.query.limite) : 50;
        
        const notificaciones = await obtenerTodasNotificaciones(usuarioId, limite);

        return res.status(200).json(notificaciones);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};

/**
 * Controlador: Contar notificaciones no leídas
 * GET /notificaciones/contador
 */
export const contarNotificacionesNoLeidasController = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const count = await contarNotificacionesNoLeidas(usuarioId);

        return res.status(200).json({ count });
    } catch (error) {
        console.error('Error al contar notificaciones:', error);
        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};

/**
 * Controlador: Marcar notificación como leída
 * PUT /notificaciones/:id/leer
 */
export const marcarComoLeidaController = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;

        const notificacion = await marcarComoLeida(id, usuarioId);

        return res.status(200).json({
            mensaje: 'Notificación marcada como leída',
            notificacion
        });
    } catch (error) {
        console.error('Error al marcar notificación:', error);

        if (error.message === 'Notificación no encontrada') {
            return res.status(404).json({
                error: 'No encontrada',
                mensaje: error.message
            });
        }

        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};

/**
 * Controlador: Marcar todas las notificaciones como leídas
 * PUT /notificaciones/leer-todas
 */
export const marcarTodasComoLeidasController = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const resultado = await marcarTodasComoLeidas(usuarioId);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al marcar todas las notificaciones:', error);
        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};

/**
 * Controlador: Eliminar notificación
 * DELETE /notificaciones/:id
 */
export const eliminarNotificacionController = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;

        const resultado = await eliminarNotificacion(id, usuarioId);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al eliminar notificación:', error);

        if (error.message === 'Notificación no encontrada') {
            return res.status(404).json({
                error: 'No encontrada',
                mensaje: error.message
            });
        }

        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};
