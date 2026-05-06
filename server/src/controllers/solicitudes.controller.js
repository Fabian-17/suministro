import {
    crearSolicitud,
    obtenerTodasSolicitudes,
    obtenerSolicitudPorId,
    obtenerMisSolicitudes,
    obtenerSolicitudesPendientes,
    obtenerSolicitudesAprobadas,
    aprobarSolicitud,
    rechazarSolicitud,
    procesarSolicitud,
    eliminarSolicitud
} from '../services/solicitudes.service.js';

/**
 * Controlador: Crear nueva solicitud
 * POST /solicitudes
 */
export const crearSolicitudController = async (req, res) => {
    try {
        const { items, observaciones } = req.body;
        const usuarioId = req.usuario.id;

        // Validaciones
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Datos inválidos',
                mensaje: 'Debe incluir al menos un artículo'
            });
        }

        // Validar formato de items
        for (const item of items) {
            if (!item.inventarioId || !item.cantidad || item.cantidad <= 0) {
                return res.status(400).json({
                    error: 'Datos inválidos',
                    mensaje: 'Cada item debe tener inventarioId y cantidad válida'
                });
            }
        }

        const solicitud = await crearSolicitud(usuarioId, items, observaciones);

        // Emitir evento Socket.io (si está configurado)
        try {
            const io = req.app.get('io');
            if (io) {
                io.to('encargados').emit('solicitud:nueva', {
                    solicitudId: solicitud.id,
                    solicitante: solicitud.usuario.encargado.nombre,
                    area: solicitud.area.nombre,
                    cantidadItems: solicitud.items.length
                });
            }
        } catch (socketError) {
            console.error('Error al emitir Socket.io:', socketError);
        }

        return res.status(201).json({
            mensaje: 'Solicitud creada exitosamente',
            solicitud
        });
    } catch (error) {
        console.error('Error al crear solicitud:', error);

        if (error.message.includes('Stock insuficiente') || 
            error.message.includes('no encontrado') ||
            error.message.includes('no tiene')) {
            return res.status(400).json({
                error: 'Error de validación',
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
 * Controlador: Obtener todas las solicitudes
 * GET /solicitudes
 */
export const obtenerSolicitudesController = async (req, res) => {
    try {
        const { estado, areaId } = req.query;
        
        const filtros = {};
        if (estado) filtros.estado = estado;
        if (areaId) filtros.areaId = parseInt(areaId);

        const solicitudes = await obtenerTodasSolicitudes(filtros);

        return res.status(200).json(solicitudes);
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};

/**
 * Controlador: Obtener solicitud por ID
 * GET /solicitudes/:id
 */
export const obtenerSolicitudController = async (req, res) => {
    try {
        const { id } = req.params;
        const solicitud = await obtenerSolicitudPorId(id);

        // Validar permisos: solo el solicitante o encargados/admins pueden ver
        if (req.usuario.rol === 'solicitante' && 
            solicitud.usuarioId !== req.usuario.id) {
            return res.status(403).json({
                error: 'Acceso denegado',
                mensaje: 'No tienes permiso para ver esta solicitud'
            });
        }

        return res.status(200).json(solicitud);
    } catch (error) {
        console.error('Error al obtener solicitud:', error);

        if (error.message === 'Solicitud no encontrada') {
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
 * Controlador: Obtener mis solicitudes
 * GET /solicitudes/mis-solicitudes
 */
export const obtenerMisSolicitudesController = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const solicitudes = await obtenerMisSolicitudes(usuarioId);

        return res.status(200).json(solicitudes);
    } catch (error) {
        console.error('Error al obtener mis solicitudes:', error);
        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};

/**
 * Controlador: Obtener solicitudes pendientes
 * GET /solicitudes/pendientes
 */
export const obtenerSolicitudesPendientesController = async (req, res) => {
    try {
        const solicitudes = await obtenerSolicitudesPendientes();
        return res.status(200).json(solicitudes);
    } catch (error) {
        console.error('Error al obtener solicitudes pendientes:', error);
        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};

/**
 * Controlador: Obtener solicitudes aprobadas
 * GET /solicitudes/aprobadas
 */
export const obtenerSolicitudesAprobadasController = async (req, res) => {
    try {
        const solicitudes = await obtenerSolicitudesAprobadas();
        return res.status(200).json(solicitudes);
    } catch (error) {
        console.error('Error al obtener solicitudes aprobadas:', error);
        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};

/**
 * Controlador: Aprobar solicitud
 * PUT /solicitudes/:id/aprobar
 */
export const aprobarSolicitudController = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;
        const aprobadoPorId = req.usuario.id;

        // Validaciones
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Datos inválidos',
                mensaje: 'Debe incluir los items con las cantidades aprobadas'
            });
        }

        const solicitud = await aprobarSolicitud(id, items, aprobadoPorId);

        // Emitir evento Socket.io
        try {
            const io = req.app.get('io');
            if (io) {
                io.to(`user-${solicitud.usuarioId}`).emit('solicitud:aprobada', {
                    solicitudId: solicitud.id,
                    mensaje: 'Tu solicitud ha sido aprobada'
                });
            }
        } catch (socketError) {
            console.error('Error al emitir Socket.io:', socketError);
        }

        return res.status(200).json({
            mensaje: 'Solicitud aprobada exitosamente',
            solicitud
        });
    } catch (error) {
        console.error('Error al aprobar solicitud:', error);

        if (error.message.includes('no encontrada') ||
            error.message.includes('Solo se pueden') ||
            error.message.includes('Stock insuficiente') ||
            error.message.includes('no puede ser mayor')) {
            return res.status(400).json({
                error: 'Error de validación',
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
 * Controlador: Rechazar solicitud
 * PUT /solicitudes/:id/rechazar
 */
export const rechazarSolicitudController = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;
        const rechazadoPorId = req.usuario.id;

        // Validación
        if (!motivo || motivo.trim() === '') {
            return res.status(400).json({
                error: 'Datos inválidos',
                mensaje: 'Debe proporcionar un motivo de rechazo'
            });
        }

        const solicitud = await rechazarSolicitud(id, motivo, rechazadoPorId);

        // Emitir evento Socket.io
        try {
            const io = req.app.get('io');
            if (io) {
                io.to(`user-${solicitud.usuarioId}`).emit('solicitud:rechazada', {
                    solicitudId: solicitud.id,
                    motivo,
                    mensaje: 'Tu solicitud ha sido rechazada'
                });
            }
        } catch (socketError) {
            console.error('Error al emitir Socket.io:', socketError);
        }

        return res.status(200).json({
            mensaje: 'Solicitud rechazada',
            solicitud
        });
    } catch (error) {
        console.error('Error al rechazar solicitud:', error);

        if (error.message.includes('no encontrada') ||
            error.message.includes('Solo se pueden')) {
            return res.status(400).json({
                error: 'Error de validación',
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
 * Controlador: Procesar solicitud (generar salidas automáticas)
 * POST /solicitudes/:id/procesar
 */
export const procesarSolicitudController = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha } = req.body;
        const procesadoPorId = req.usuario.id;

        const fechaSalida = fecha ? new Date(fecha) : new Date();

        const resultado = await procesarSolicitud(id, procesadoPorId, fechaSalida);

        // Emitir evento Socket.io
        try {
            const io = req.app.get('io');
            if (io) {
                io.to(`user-${resultado.solicitud.usuarioId}`).emit('solicitud:procesada', {
                    solicitudId: resultado.solicitud.id,
                    mensaje: 'Tu solicitud fue procesada. Los artículos están listos para retirar'
                });
            }
        } catch (socketError) {
            console.error('Error al emitir Socket.io:', socketError);
        }

        return res.status(200).json({
            mensaje: 'Solicitud procesada exitosamente',
            solicitud: resultado.solicitud,
            salidas: resultado.salidas
        });
    } catch (error) {
        console.error('Error al procesar solicitud:', error);

        if (error.message.includes('no encontrada') ||
            error.message.includes('Solo se pueden') ||
            error.message.includes('Stock insuficiente')) {
            return res.status(400).json({
                error: 'Error de validación',
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
 * Controlador: Eliminar solicitud
 * DELETE /solicitudes/:id
 */
export const eliminarSolicitudController = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';

        const resultado = await eliminarSolicitud(id, usuarioId, esAdmin);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al eliminar solicitud:', error);

        if (error.message.includes('no encontrada') ||
            error.message.includes('No tienes permiso') ||
            error.message.includes('Solo se pueden')) {
            return res.status(400).json({
                error: 'Error de validación',
                mensaje: error.message
            });
        }

        return res.status(500).json({
            error: 'Error del servidor',
            mensaje: error.message
        });
    }
};
