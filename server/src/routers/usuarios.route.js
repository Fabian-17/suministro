import { Router } from 'express';
import { 
    obtenerUsuariosController,
    obtenerUsuarioController,
    crearUsuarioController,
    actualizarUsuarioController,
    eliminarUsuarioController,
    activarUsuarioController,
    obtenerUsuariosPorRolController
} from '../controllers/usuarios.controller.js';
import { verificarToken, soloAdmin } from '../middlewares/auth.js';

const router = Router();

/**
 * Rutas de gestión de usuarios
 * Base: /usuarios
 * Todas las rutas requieren autenticación
 * La mayoría requieren rol de admin
 */

// Aplicar verificación de token a todas las rutas
router.use(verificarToken);

// GET /usuarios - Obtener todos los usuarios (solo admin)
router.get('/', soloAdmin, obtenerUsuariosController);

// GET /usuarios/rol/:rol - Obtener usuarios por rol (solo admin)
router.get('/rol/:rol', soloAdmin, obtenerUsuariosPorRolController);

// GET /usuarios/:id - Obtener usuario por ID (solo admin)
router.get('/:id', soloAdmin, obtenerUsuarioController);

// POST /usuarios - Crear nuevo usuario (solo admin)
router.post('/', soloAdmin, crearUsuarioController);

// PUT /usuarios/:id - Actualizar usuario (solo admin)
router.put('/:id', soloAdmin, actualizarUsuarioController);

// PUT /usuarios/:id/activar - Activar usuario (solo admin)
router.put('/:id/activar', soloAdmin, activarUsuarioController);

// DELETE /usuarios/:id - Eliminar (desactivar) usuario (solo admin)
router.delete('/:id', soloAdmin, eliminarUsuarioController);

export default router;
