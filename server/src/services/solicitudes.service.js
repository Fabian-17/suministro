import { Solicitudes } from '../models/solicitudes.js';
import { SolicitudItems } from '../models/solicitud_items.js';
import { Usuarios } from '../models/usuarios.js';
import { Encargados } from '../models/encargados.js';
import { Areas } from '../models/areas.js';
import { Inventario } from '../models/inventario.js';
import { Salida } from '../models/salida.js';
import { sequelize } from '../config/configDB.js';
import { Op } from 'sequelize';
import { 
    notificarNuevaSolicitud,
    notificarSolicitudAprobada,
    notificarSolicitudRechazada,
    notificarSolicitudProcesada
} from './notificacion.service.js';

/**
 * Crear nueva solicitud
 */
export const crearSolicitud = async (usuarioId, items, observaciones = '', justificacion = '') => {
    const transaction = await sequelize.transaction();
    
    try {
        // Obtener usuario con su encargado y área
        const usuario = await Usuarios.findByPk(usuarioId, {
            include: [
                {
                    model: Encargados,
                    as: 'encargado',
                    include: [
                        {
                            model: Areas,
                            as: 'areas',
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Validar que el usuario tenga encargado vinculado
        if (!usuario.encargado) {
            throw new Error('El usuario no tiene un encargado vinculado');
        }

        // Validar que el encargado tenga al menos un área
        if (!usuario.encargado.areas || usuario.encargado.areas.length === 0) {
            throw new Error('El encargado no tiene áreas asignadas');
        }

        // Usar la primera área del encargado
        const areaId = usuario.encargado.areas[0].id;

        // Validar que haya items
        if (!items || items.length === 0) {
            throw new Error('Debe incluir al menos un artículo en la solicitud');
        }

        // Validar stock disponible para cada item
        for (const item of items) {
            const articulo = await Inventario.findByPk(item.inventarioId);
            
            if (!articulo) {
                throw new Error(`Artículo con ID ${item.inventarioId} no encontrado`);
            }

            if (articulo.cantidad < item.cantidad) {
                throw new Error(`Stock insuficiente para ${articulo.articulo}. Disponible: ${articulo.cantidad}, Solicitado: ${item.cantidad}`);
            }
        }

        // Crear solicitud
        const solicitud = await Solicitudes.create({
            usuarioId,
            areaId,
            estado: 'pendiente',
            observaciones,
            justificacion,
            fecha_solicitud: new Date()
        }, { transaction });

        // Crear items de la solicitud
        const itemsCreados = [];
        for (const item of items) {
            const articulo = await Inventario.findByPk(item.inventarioId);
            
            const itemCreado = await SolicitudItems.create({
                solicitudId: solicitud.id,
                inventarioId: item.inventarioId,
                articulo: articulo.articulo,
                codigo: articulo.codigo,
                cantidad_solicitada: item.cantidad,
                cantidad_aprobada: 0
            }, { transaction });

            itemsCreados.push(itemCreado);
        }

        await transaction.commit();

        // Notificar a encargados de suministro
        await notificarNuevaSolicitud(solicitud, usuario.encargado.nombre);

        // Retornar solicitud completa
        return await obtenerSolicitudPorId(solicitud.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Obtener todas las solicitudes
 */
export const obtenerTodasSolicitudes = async (filtros = {}) => {
    try {
        const where = {};

        if (filtros.estado) {
            where.estado = filtros.estado;
        }

        if (filtros.usuarioId) {
            where.usuarioId = filtros.usuarioId;
        }

        if (filtros.areaId) {
            where.areaId = filtros.areaId;
        }

        const solicitudes = await Solicitudes.findAll({
            where,
            include: [
                {
                    model: Usuarios,
                    as: 'usuario',
                    attributes: ['id', 'username', 'rol'],
                    include: [
                        {
                            model: Encargados,
                            as: 'encargado',
                            attributes: ['id', 'nombre']
                        }
                    ]
                },
                {
                    model: Areas,
                    as: 'area',
                    attributes: ['id', 'nombre']
                },
                {
                    model: SolicitudItems,
                    as: 'items',
                    include: [
                        {
                            model: Inventario,
                            as: 'inventario',
                            attributes: ['id', 'articulo', 'codigo', 'cantidad']
                        }
                    ]
                },
                {
                    model: Usuarios,
                    as: 'aprobador',
                    attributes: ['id', 'username'],
                    required: false
                },
                {
                    model: Usuarios,
                    as: 'procesador',
                    attributes: ['id', 'username'],
                    required: false
                }
            ],
            order: [['fecha_solicitud', 'DESC']]
        });

        return solicitudes;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener solicitud por ID
 */
export const obtenerSolicitudPorId = async (id) => {
    try {
        const solicitud = await Solicitudes.findByPk(id, {
            include: [
                {
                    model: Usuarios,
                    as: 'usuario',
                    attributes: ['id', 'username', 'rol'],
                    include: [
                        {
                            model: Encargados,
                            as: 'encargado',
                            attributes: ['id', 'nombre']
                        }
                    ]
                },
                {
                    model: Areas,
                    as: 'area',
                    attributes: ['id', 'nombre']
                },
                {
                    model: SolicitudItems,
                    as: 'items',
                    include: [
                        {
                            model: Inventario,
                            as: 'inventario',
                            attributes: ['id', 'articulo', 'codigo', 'cantidad']
                        }
                    ]
                },
                {
                    model: Usuarios,
                    as: 'aprobador',
                    attributes: ['id', 'username'],
                    required: false
                },
                {
                    model: Usuarios,
                    as: 'procesador',
                    attributes: ['id', 'username'],
                    required: false
                },
                {
                    model: Salida,
                    as: 'salidas',
                    required: false
                }
            ]
        });

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        return solicitud;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener solicitudes del usuario logueado
 */
export const obtenerMisSolicitudes = async (usuarioId) => {
    try {
        return await obtenerTodasSolicitudes({ usuarioId });
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener solicitudes pendientes
 */
export const obtenerSolicitudesPendientes = async () => {
    try {
        return await obtenerTodasSolicitudes({ estado: 'pendiente' });
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener solicitudes aprobadas (listas para procesar)
 */
export const obtenerSolicitudesAprobadas = async () => {
    try {
        return await obtenerTodasSolicitudes({ estado: 'aprobada' });
    } catch (error) {
        throw error;
    }
};

/**
 * Aprobar solicitud (total o parcialmente)
 */
export const aprobarSolicitud = async (solicitudId, itemsAprobados, aprobadoPorId) => {
    const transaction = await sequelize.transaction();
    
    try {
        const solicitud = await Solicitudes.findByPk(solicitudId, {
            include: [
                {
                    model: SolicitudItems,
                    as: 'items'
                }
            ]
        });

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        if (solicitud.estado !== 'pendiente') {
            throw new Error('Solo se pueden aprobar solicitudes pendientes');
        }

        // Actualizar cantidades aprobadas de cada item
        for (const itemAprobado of itemsAprobados) {
            const item = await SolicitudItems.findByPk(itemAprobado.id);
            
            if (!item) {
                throw new Error(`Item ${itemAprobado.id} no existe en la base de datos`);
            }

            // Convertir a número para comparación (solicitudId puede venir como string de URL)
            if (item.solicitudId !== parseInt(solicitudId)) {
                throw new Error(`Item ${itemAprobado.id} pertenece a la solicitud ${item.solicitudId}, no a la ${solicitudId}`);
            }

            // Validar que la cantidad aprobada no sea mayor a la solicitada
            if (itemAprobado.cantidad_aprobada > item.cantidad_solicitada) {
                throw new Error(`La cantidad aprobada no puede ser mayor a la solicitada para ${item.articulo}`);
            }

            // Validar stock disponible
            const articulo = await Inventario.findByPk(item.inventarioId);
            if (articulo.cantidad < itemAprobado.cantidad_aprobada) {
                throw new Error(`Stock insuficiente para ${articulo.articulo}. Disponible: ${articulo.cantidad}`);
            }

            await item.update({
                cantidad_aprobada: itemAprobado.cantidad_aprobada
            }, { transaction });
        }

        // Actualizar estado de la solicitud
        await solicitud.update({
            estado: 'aprobada',
            aprobada_por: aprobadoPorId,
            fecha_aprobada: new Date()
        }, { transaction });

        await transaction.commit();

        // Notificar al solicitante
        await notificarSolicitudAprobada(solicitudId, solicitud.usuarioId);

        return await obtenerSolicitudPorId(solicitudId);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Rechazar solicitud
 */
export const rechazarSolicitud = async (solicitudId, motivo, rechazadoPorId) => {
    try {
        const solicitud = await Solicitudes.findByPk(solicitudId);

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        if (solicitud.estado !== 'pendiente') {
            throw new Error('Solo se pueden rechazar solicitudes pendientes');
        }

        await solicitud.update({
            estado: 'rechazada',
            motivo_rechazo: motivo,
            aprobada_por: rechazadoPorId,
            fecha_aprobada: new Date()
        });

        // Notificar al solicitante
        await notificarSolicitudRechazada(solicitudId, solicitud.usuarioId, motivo);

        return await obtenerSolicitudPorId(solicitudId);
    } catch (error) {
        throw error;
    }
};

/**
 * Procesar solicitud aprobada (generar salidas automáticas)
 */
export const procesarSolicitud = async (solicitudId, procesadoPorId, fechaSalida = new Date()) => {
    const transaction = await sequelize.transaction();
    
    try {
        const solicitud = await Solicitudes.findByPk(solicitudId, {
            include: [
                {
                    model: Usuarios,
                    as: 'usuario',
                    include: [
                        {
                            model: Encargados,
                            as: 'encargado'
                        }
                    ]
                },
                {
                    model: Areas,
                    as: 'area'
                },
                {
                    model: SolicitudItems,
                    as: 'items',
                    include: [
                        {
                            model: Inventario,
                            as: 'inventario'
                        }
                    ]
                }
            ]
        });

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        if (solicitud.estado !== 'aprobada') {
            throw new Error('Solo se pueden procesar solicitudes aprobadas');
        }

        const salidas = [];

        // Crear una salida por cada item aprobado
        for (const item of solicitud.items) {
            if (item.cantidad_aprobada > 0) {
                // Verificar stock nuevamente
                const articulo = await Inventario.findByPk(item.inventarioId);
                
                if (articulo.cantidad < item.cantidad_aprobada) {
                    throw new Error(`Stock insuficiente para ${articulo.articulo}. Disponible: ${articulo.cantidad}`);
                }

                // Crear salida
                const salida = await Salida.create({
                    articulo: item.articulo,
                    cantidad: item.cantidad_aprobada,
                    codigo: item.codigo,
                    fecha: fechaSalida,
                    area: solicitud.area.nombre,
                    destinatario: solicitud.usuario.encargado.nombre,
                    inventarioId: item.inventarioId,
                    solicitudId: solicitud.id,
                    usuarioId: procesadoPorId
                }, { transaction });

                salidas.push(salida);

                // Actualizar inventario
                await articulo.update({
                    cantidad: articulo.cantidad - item.cantidad_aprobada,
                    salida: articulo.salida + item.cantidad_aprobada
                }, { transaction });
            }
        }

        // Actualizar estado de la solicitud
        await solicitud.update({
            estado: 'procesada',
            procesada_por: procesadoPorId,
            fecha_procesada: new Date()
        }, { transaction });

        await transaction.commit();

        // Notificar al solicitante
        await notificarSolicitudProcesada(solicitudId, solicitud.usuarioId);

        return {
            solicitud: await obtenerSolicitudPorId(solicitudId),
            salidas
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Eliminar solicitud (solo si está pendiente)
 */
export const eliminarSolicitud = async (solicitudId, usuarioId, esAdmin = false) => {
    try {
        const solicitud = await Solicitudes.findByPk(solicitudId);

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        // Solo el solicitante o un admin puede eliminar
        if (!esAdmin && solicitud.usuarioId !== usuarioId) {
            throw new Error('No tienes permiso para eliminar esta solicitud');
        }

        // Solo se pueden eliminar solicitudes pendientes
        if (solicitud.estado !== 'pendiente') {
            throw new Error('Solo se pueden eliminar solicitudes pendientes');
        }

        await solicitud.destroy();

        return { mensaje: 'Solicitud eliminada exitosamente' };
    } catch (error) {
        throw error;
    }
};
