import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";

export const SolicitudItems = sequelize.define("solicitud_items", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    solicitudId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    inventarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    articulo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    codigo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    cantidad_solicitada: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad_aprobada: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
},
{
    tableName: "solicitud_items",
    timestamps: true
});
