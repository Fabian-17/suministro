import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";

export const NotaPedido = sequelize.define("nota_pedido", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    articulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    archivado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
    timestamps: true,
    tableName: 'nota_pedido'
});
