import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";

export const Notificaciones = sequelize.define("notificaciones", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('solicitud_nueva', 'solicitud_aprobada', 'solicitud_rechazada', 'solicitud_procesada'),
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    solicitudId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    leida: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},
{
    tableName: "notificaciones",
    timestamps: true,
    updatedAt: false // Solo necesitamos createdAt
});
