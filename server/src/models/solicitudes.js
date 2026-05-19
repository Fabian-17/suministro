import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";

export const Solicitudes = sequelize.define("solicitudes", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    areaId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada', 'procesada'),
        allowNull: false,
        defaultValue: 'pendiente'
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    justificacion: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Justificación formal para el documento de solicitud (ej: EJECUCION DE OBRAS DE REPARACION Y MANTENIMIENTO)'
    },
    motivo_rechazo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_solicitud: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    fecha_aprobada: {
        type: DataTypes.DATE,
        allowNull: true
    },
    fecha_procesada: {
        type: DataTypes.DATE,
        allowNull: true
    },
    aprobada_por: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    procesada_por: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
},
{
    tableName: "solicitudes",
    timestamps: true
});
