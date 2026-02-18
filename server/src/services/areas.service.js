import { Areas } from "../models/areas.js";
import { Op } from "sequelize";

export const getAllAreas = async () => {
    try {
        const areas = await Areas.findAll();
        return areas;
    } catch (error) {
        throw new Error("Error al obtener las áreas");
    }
};

export const createArea = async (nombreRaw) => {
    if (typeof nombreRaw !== "string") {
        throw new Error("Nombre inválido");
    }

    const nombre = nombreRaw.trim();
    if (!nombre) {
        throw new Error("El nombre es requerido");
    }
    if (nombre.length > 100) {
        throw new Error("El nombre excede la longitud permitida");
    }

    try {
        // Validar duplicados ignorando mayúsculas/minúsculas
        const existente = await Areas.findOne({ 
            where: { 
                nombre: {
                    [Op.iLike]: nombre
                }
            } 
        });
        if (existente) {
            throw new Error("El área ya existe");
        }

        const nuevaArea = await Areas.create({ nombre });
        return nuevaArea;
    } catch (err) {
        throw new Error("No se pudo crear el área: " + err.message);
    }
};