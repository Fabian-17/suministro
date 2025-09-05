import { Router } from 'express';
import { getAllAreasController, createAreaController } from '../controllers/areas.controller.js';

const router = Router();

router.get('/', getAllAreasController);
router.post('/', createAreaController);

export default router;
