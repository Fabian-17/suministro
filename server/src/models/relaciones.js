import { Inventario } from "./inventario.js";
import { Salida } from "./salida.js";
import { Entrada } from "./entrada.js";
import { Areas } from "./areas.js";
import { Encargados } from "./encargados.js";
import { AreaEncargado } from "./area_encargado.js";
import { Usuarios } from "./usuarios.js";
import { Solicitudes } from "./solicitudes.js";
import { SolicitudItems } from "./solicitud_items.js";
import { Notificaciones } from "./notificaciones.js";


const relaciones = () => {
    // === Relaciones Existentes ===
    Inventario.hasMany(Salida, { 
        foreignKey: "inventarioId",
        as: "salidas"
    });
    Salida.belongsTo(Inventario, { 
        foreignKey: "inventarioId",
        as: "inventario"
    });
    Inventario.hasMany(Entrada, { 
        foreignKey: "inventarioId",
        as: "entradas"
    });
    Entrada.belongsTo(Inventario, { 
        foreignKey: "inventarioId",
        as: "inventario"
    });

    // Relación muchos a muchos entre Areas y Encargados
    Areas.belongsToMany(Encargados, {
        through: AreaEncargado,
        foreignKey: 'areaId',
        otherKey: 'encargadoId',
        as: 'encargados'
    });
    Encargados.belongsToMany(Areas, {
        through: AreaEncargado,
        foreignKey: 'encargadoId',
        otherKey: 'areaId',
        as: 'areas'
    });

    // === Nuevas Relaciones ===
    
    // Usuario -> Encargado (1:1 opcional)
    Usuarios.belongsTo(Encargados, {
        foreignKey: 'encargadoId',
        as: 'encargado'
    });
    Encargados.hasOne(Usuarios, {
        foreignKey: 'encargadoId',
        as: 'usuario'
    });

    // Usuario -> Solicitudes (1:N)
    Usuarios.hasMany(Solicitudes, {
        foreignKey: 'usuarioId',
        as: 'solicitudes'
    });
    Solicitudes.belongsTo(Usuarios, {
        foreignKey: 'usuarioId',
        as: 'usuario'
    });

    // Area -> Solicitudes (1:N)
    Areas.hasMany(Solicitudes, {
        foreignKey: 'areaId',
        as: 'solicitudes'
    });
    Solicitudes.belongsTo(Areas, {
        foreignKey: 'areaId',
        as: 'area'
    });

    // Usuario (aprobador) -> Solicitudes
    Solicitudes.belongsTo(Usuarios, {
        foreignKey: 'aprobada_por',
        as: 'aprobador'
    });

    // Usuario (procesador) -> Solicitudes
    Solicitudes.belongsTo(Usuarios, {
        foreignKey: 'procesada_por',
        as: 'procesador'
    });

    // Solicitud -> SolicitudItems (1:N)
    Solicitudes.hasMany(SolicitudItems, {
        foreignKey: 'solicitudId',
        as: 'items'
    });
    SolicitudItems.belongsTo(Solicitudes, {
        foreignKey: 'solicitudId',
        as: 'solicitud'
    });

    // Inventario -> SolicitudItems (1:N)
    Inventario.hasMany(SolicitudItems, {
        foreignKey: 'inventarioId',
        as: 'solicitud_items'
    });
    SolicitudItems.belongsTo(Inventario, {
        foreignKey: 'inventarioId',
        as: 'inventario'
    });

    // Solicitud -> Salida (1:N) - Salidas generadas desde solicitud
    Solicitudes.hasMany(Salida, {
        foreignKey: 'solicitudId',
        as: 'salidas'
    });
    Salida.belongsTo(Solicitudes, {
        foreignKey: 'solicitudId',
        as: 'solicitud'
    });

    // Usuario -> Salida (quien registró)
    Usuarios.hasMany(Salida, {
        foreignKey: 'usuarioId',
        as: 'salidas'
    });
    Salida.belongsTo(Usuarios, {
        foreignKey: 'usuarioId',
        as: 'usuario'
    });

    // Usuario -> Notificaciones (1:N)
    Usuarios.hasMany(Notificaciones, {
        foreignKey: 'usuarioId',
        as: 'notificaciones'
    });
    Notificaciones.belongsTo(Usuarios, {
        foreignKey: 'usuarioId',
        as: 'usuario'
    });

    // Solicitud -> Notificaciones (1:N)
    Solicitudes.hasMany(Notificaciones, {
        foreignKey: 'solicitudId',
        as: 'notificaciones'
    });
    Notificaciones.belongsTo(Solicitudes, {
        foreignKey: 'solicitudId',
        as: 'solicitud'
    });
};

export default relaciones;