import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";

export const Areas = sequelize.define("areas", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: 'unique_area_nombre',
            msg: 'El nombre del área ya existe'
        }
    },
}, {
    timestamps: true,
    tableName: "areas"
});