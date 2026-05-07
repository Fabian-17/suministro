import { Router } from 'express';
import {
  getAllEncargadosController,
  createEncargadoWithAreasController,
  assignEncargadoToAreasController,
  removeEncargadoFromAreaController,
  getEncargadosByAreaController,
  getAreasByEncargadoController,
  deleteEncargadoController
} from '../controllers/encargados.controller.js';
import { verificarToken, soloEncargados } from '../middlewares/auth.js';

const router = Router();

// Todos pueden ver encargados
router.get('/', verificarToken, getAllEncargadosController);
router.get('/area/:areaId', verificarToken, getEncargadosByAreaController);
router.get('/encargado/:encargadoId', verificarToken, getAreasByEncargadoController);

// Solo encargados y admin pueden modificar
router.post('/', verificarToken, soloEncargados, createEncargadoWithAreasController);
router.post('/assign', verificarToken, soloEncargados, assignEncargadoToAreasController);
router.post('/remove', verificarToken, soloEncargados, removeEncargadoFromAreaController);
router.delete('/encargado/:id', verificarToken, soloEncargados, deleteEncargadoController);

export default router;
