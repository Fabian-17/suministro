import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";

export const AreaEncargado = sequelize.define("area_encargado", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  areaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  encargadoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: "area_encargado"
});
