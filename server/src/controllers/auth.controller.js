import { loginService, verificarTokenService, cambiarPasswordService } from '../services/auth.service.js';

/**
 * Controlador: Login de usuario
 * POST /auth/login
 */
export const loginController = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validaciones
        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Datos incompletos',
                mensaje: 'Usuario y contraseña son requeridos' 
            });
        }

        // Login
        const resultado = await loginService(username, password);

        return res.status(200).json({
            mensaje: 'Login exitoso',
            ...resultado
        });
    } catch (error) {
        console.error('Error en login:', error);
        
        // Errores específicos de autenticación
        if (error.message.includes('incorrectos') || error.message.includes('desactivado')) {
            return res.status(401).json({ 
                error: 'Error de autenticación',
                mensaje: error.message 
            });
        }

        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: 'Error al procesar el login' 
        });
    }
};

/**
 * Controlador: Obtener información del usuario logueado
 * GET /auth/me
 */
export const obtenerUsuarioActualController = async (req, res) => {
    try {
        // req.usuario viene del middleware verificarToken
        const usuario = await verificarTokenService(req.usuario.id);

        return res.status(200).json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: error.message 
        });
    }
};

/**
 * Controlador: Cambiar contraseña
 * PUT /auth/cambiar-password
 */
export const cambiarPasswordController = async (req, res) => {
    try {
        const { passwordActual, passwordNueva } = req.body;

        // Validaciones
        if (!passwordActual || !passwordNueva) {
            return res.status(400).json({ 
                error: 'Datos incompletos',
                mensaje: 'Contraseña actual y nueva son requeridas' 
            });
        }

        if (passwordNueva.length < 6) {
            return res.status(400).json({ 
                error: 'Contraseña débil',
                mensaje: 'La nueva contraseña debe tener al menos 6 caracteres' 
            });
        }

        // Cambiar contraseña
        const resultado = await cambiarPasswordService(
            req.usuario.id, 
            passwordActual, 
            passwordNueva
        );

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        
        if (error.message.includes('incorrecta')) {
            return res.status(401).json({ 
                error: 'Contraseña incorrecta',
                mensaje: error.message 
            });
        }

        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: 'Error al cambiar contraseña' 
        });
    }
};

/**
 * Controlador: Logout (simplemente responde OK, el frontend elimina el token)
 * POST /auth/logout
 */
export const logoutController = async (req, res) => {
    try {
        return res.status(200).json({ 
            mensaje: 'Sesión cerrada exitosamente' 
        });
    } catch (error) {
        console.error('Error en logout:', error);
        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: error.message 
        });
    }
};
