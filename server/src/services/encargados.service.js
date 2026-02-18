import { Encargados } from "../models/encargados.js";
import { Areas } from "../models/areas.js";
import { AreaEncargado } from "../models/area_encargado.js";
import { Op } from "sequelize";


export const getAllEncargados = async () => {
    try {
        const encargados = await Encargados.findAll();
        return encargados; // Devuelve array vacío si no hay
    } catch (error) {
        throw new Error("Error al obtener los encargados: " + error.message);
    }
};

// Crear un encargado y asignarlo a una o varias áreas
export const createEncargadoWithAreas = async (nombreRaw, areaIds = []) => {
    // Validar que el nombre sea una cadena válida
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

    // Verificar si ya existe un encargado con ese nombre (ignorando mayúsculas/minúsculas)
    const existente = await Encargados.findOne({ 
        where: { 
            nombre: {
                [Op.iLike]: nombre
            }
        } 
    });
    if (existente) {
        throw new Error("El encargado ya existe");
    }

    const encargado = await Encargados.create({ nombre });
    if (areaIds.length > 0) {
        await encargado.setAreas(areaIds); // método de Sequelize por belongsToMany
    }
    return encargado;
};

// Asignar un encargado a un área (o varias)
export const assignEncargadoToAreas = async (encargadoId, areaIds) => {
    const encargado = await Encargados.findByPk(encargadoId);
    if (!encargado) throw new Error('Encargado no encontrado');
    await encargado.addAreas(areaIds);
    return encargado;
};

// Quitar un encargado de un área
export const removeEncargadoFromArea = async (encargadoId, areaId) => {
    const encargado = await Encargados.findByPk(encargadoId);
    if (!encargado) throw new Error('Encargado no encontrado');
    await encargado.removeArea(areaId);
    return encargado;
};

// Obtener encargados de un área
export const getEncargadosByArea = async (areaId) => {
    const area = await Areas.findByPk(areaId, { include: ['encargados'] });
    if (!area) throw new Error('Área no encontrada');
    return area.encargados;
};

// Obtener áreas de un encargado
export const getAreasByEncargado = async (encargadoId) => {
    const encargado = await Encargados.findByPk(encargadoId, { include: ['areas'] });
    if (!encargado) throw new Error('Encargado no encontrado');
    return encargado.areas;
};

// Eliminar encargado por id
export const deleteEncargado = async (id) => {
    const encargado = await Encargados.findByPk(id);
    if (!encargado) throw new Error('Encargado no encontrado');
    await encargado.destroy();
    return true;
}