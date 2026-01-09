import { Router } from "express";
import { obtenerTodos, crear, eliminar, limpiarTodos } from "../controllers/notaPedido.controller.js";

const router = Router();

router.get('/', obtenerTodos);
router.post('/', crear);
router.delete('/:id', eliminar);
router.delete('/', limpiarTodos);

export default router;
