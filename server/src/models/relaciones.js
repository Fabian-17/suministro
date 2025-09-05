import { Inventario } from "./inventario.js";
import { Salida } from "./salida.js";
import { Entrada } from "./entrada.js";
import { Areas } from "./areas.js";
import { Encargados } from "./encargados.js";
import { AreaEncargado } from "./area_encargado.js";


const relaciones = () => {
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
};

export default relaciones;