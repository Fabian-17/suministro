import { NotaPedido } from "../models/notaPedido.js";

// Obtener todos los artículos
export const obtenerTodos = async (req, res) => {
    try {
        const items = await NotaPedido.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener artículos' });
    }
};

// Crear un nuevo artículo
export const crear = async (req, res) => {
    try {
        const { articulo, fecha } = req.body;
        
        if (!articulo) {
            return res.status(400).json({ error: 'El artículo es requerido' });
        }

        const nuevoItem = await NotaPedido.create({
            articulo,
            fecha: fecha || new Date().toISOString().split('T')[0]
        });

        res.status(201).json(nuevoItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear artículo' });
    }
};

// Eliminar un artículo
export const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        
        const item = await NotaPedido.findByPk(id);
        if (!item) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        await item.destroy();
        res.json({ message: 'Artículo eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar artículo' });
    }
};

// Limpiar toda la lista
export const limpiarTodos = async (req, res) => {
    try {
        await NotaPedido.destroy({ where: {} });
        res.json({ message: 'Lista limpiada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al limpiar lista' });
    }
};
