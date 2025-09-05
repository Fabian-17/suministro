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
        allowNull: false
    },
}, {
    timestamps: true,
    tableName: "areas"
});