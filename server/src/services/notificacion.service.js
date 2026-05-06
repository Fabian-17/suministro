import { Notificaciones } from '../models/notificaciones.js';
import { Usuarios } from '../models/usuarios.js';
import { Solicitudes } from '../models/solicitudes.js';
import { Op } from 'sequelize';

/**
 * Crear notificación y guardar en BD
 * El Socket.io se emitirá desde el controlador
 */
export const crearNotificacion = async (usuarioId, tipo, titulo, mensaje, solicitudId = null) => {
    try {
        const notificacion = await Notificaciones.create({
            usuarioId,
            tipo,
            titulo,
            mensaje,
            solicitudId,
            leida: false
        });

        return notificacion;
    } catch (error) {
        throw error;
    }
};

/**
 * Notificar a encargados de suministro y admins sobre nueva solicitud
 */
export const notificarNuevaSolicitud = async (solicitud, solicitanteNombre) => {
    try {
        // Obtener todos los encargados de suministro y admins activos
        const usuariosANotificar = await Usuarios.findAll({
            where: {
                rol: ['encargado_suministro', 'admin'],
                activo: true
            }
        });

        const notificaciones = [];

        for (const usuario of usuariosANotificar) {
            const notificacion = await crearNotificacion(
                usuario.id,
                'solicitud_nueva',
                'Nueva solicitud recibida',
                `${solicitanteNombre} solicitó artículos para revisión`,
                solicitud.id
            );
            notificaciones.push(notificacion);
        }

        return notificaciones;
    } catch (error) {
        throw error;
    }
};

/**
 * Notificar al solicitante sobre aprobación
 */
export const notificarSolicitudAprobada = async (solicitudId, usuarioId) => {
    try {
        const notificacion = await crearNotificacion(
            usuarioId,
            'solicitud_aprobada',
            '✅ Solicitud aprobada',
            'Tu solicitud ha sido aprobada y está lista para ser procesada',
            solicitudId
        );

        return notificacion;
    } catch (error) {
        throw error;
    }
};

/**
 * Notificar al solicitante sobre rechazo
 */
export const notificarSolicitudRechazada = async (solicitudId, usuarioId, motivo) => {
    try {
        const notificacion = await crearNotificacion(
            usuarioId,
            'solicitud_rechazada',
            '❌ Solicitud rechazada',
            `Tu solicitud fue rechazada. Motivo: ${motivo}`,
            solicitudId
        );

        return notificacion;
    } catch (error) {
        throw error;
    }
};

/**
 * Notificar al solicitante que su solicitud fue procesada (salidas generadas)
 */
export const notificarSolicitudProcesada = async (solicitudId, usuarioId) => {
    try {
        const notificacion = await crearNotificacion(
            usuarioId,
            'solicitud_procesada',
            '✅ Solicitud procesada',
            'Tu solicitud fue procesada exitosamente. Los artículos están listos para retirar',
            solicitudId
        );

        return notificacion;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener notificaciones no leídas de un usuario
 */
export const obtenerNotificacionesNoLeidas = async (usuarioId) => {
    try {
        const notificaciones = await Notificaciones.findAll({
            where: {
                usuarioId,
                leida: false
            },
            include: [
                {
                    model: Solicitudes,
                    as: 'solicitud',
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        return notificaciones;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener todas las notificaciones de un usuario
 */
export const obtenerTodasNotificaciones = async (usuarioId, limite = 50) => {
    try {
        const notificaciones = await Notificaciones.findAll({
            where: { usuarioId },
            include: [
                {
                    model: Solicitudes,
                    as: 'solicitud',
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limite
        });

        return notificaciones;
    } catch (error) {
        throw error;
    }
};

/**
 * Marcar notificación como leída
 */
export const marcarComoLeida = async (id, usuarioId) => {
    try {
        const notificacion = await Notificaciones.findOne({
            where: {
                id,
                usuarioId
            }
        });

        if (!notificacion) {
            throw new Error('Notificación no encontrada');
        }

        await notificacion.update({ leida: true });

        return notificacion;
    } catch (error) {
        throw error;
    }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasComoLeidas = async (usuarioId) => {
    try {
        await Notificaciones.update(
            { leida: true },
            {
                where: {
                    usuarioId,
                    leida: false
                }
            }
        );

        return { mensaje: 'Todas las notificaciones marcadas como leídas' };
    } catch (error) {
        throw error;
    }
};

/**
 * Eliminar notificación
 */
export const eliminarNotificacion = async (id, usuarioId) => {
    try {
        const notificacion = await Notificaciones.findOne({
            where: {
                id,
                usuarioId
            }
        });

        if (!notificacion) {
            throw new Error('Notificación no encontrada');
        }

        await notificacion.destroy();

        return { mensaje: 'Notificación eliminada' };
    } catch (error) {
        throw error;
    }
};

/**
 * Contar notificaciones no leídas
 */
export const contarNotificacionesNoLeidas = async (usuarioId) => {
    try {
        const count = await Notificaciones.count({
            where: {
                usuarioId,
                leida: false
            }
        });

        return count;
    } catch (error) {
        throw error;
    }
};
