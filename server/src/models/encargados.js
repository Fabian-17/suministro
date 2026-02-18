import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";

export const Encargados = sequelize.define("encargados", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: 'unique_encargado_nombre',
            msg: 'El nombre del encargado ya existe'
        }
    },
},
{
    timestamps: true,
    tableName: "encargados"
})