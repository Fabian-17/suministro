import { Router } from 'express';
import { getAllAreasController, createAreaController } from '../controllers/areas.controller.js';
import { verificarToken, soloEncargados } from '../middlewares/auth.js';

const router = Router();

// Todos pueden ver áreas
router.get('/', verificarToken, getAllAreasController);

// Solo encargados y admin pueden crear
router.post('/', verificarToken, soloEncargados, createAreaController);

export default router;
