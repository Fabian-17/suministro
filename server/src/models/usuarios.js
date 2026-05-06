import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";

export const Usuarios = sequelize.define("usuarios", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('admin', 'encargado_suministro', 'solicitante'),
        allowNull: false
    },
    encargadoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
},
{
    tableName: "usuarios",
    timestamps: true
});
