import { getAllAreas, createArea } from '../services/areas.service.js';

export const getAllAreasController = async (req, res) => {
  try {
    const areas = await getAllAreas();
    res.status(200).json(areas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAreaController = async (req, res) => {
  try {
    const { nombre } = req.body;
    const area = await createArea(nombre);
    res.status(201).json(area);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
