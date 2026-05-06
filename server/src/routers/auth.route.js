import { Router } from 'express';
import { 
    loginController, 
    obtenerUsuarioActualController,
    cambiarPasswordController,
    logoutController
} from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

/**
 * Rutas de autenticación
 * Base: /auth
 */

// POST /auth/login - Login de usuario (público)
router.post('/login', loginController);

// POST /auth/logout - Logout (autenticado)
router.post('/logout', verificarToken, logoutController);

// GET /auth/me - Obtener info del usuario actual (autenticado)
router.get('/me', verificarToken, obtenerUsuarioActualController);

// PUT /auth/cambiar-password - Cambiar contraseña (autenticado)
router.put('/cambiar-password', verificarToken, cambiarPasswordController);

export default router;
