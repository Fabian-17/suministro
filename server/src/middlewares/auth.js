import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'suministro_secret_key_change_in_production';

/**
 * Middleware para verificar el token JWT
 * Extrae y valida el token del header Authorization
 */
export const verificarToken = (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'No autorizado',
                mensaje: 'Token no proporcionado' 
            });
        }

        // Extraer token
        const token = authHeader.split(' ')[1];

        // Verificar y decodificar token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Agregar info del usuario al request
        req.usuario = {
            id: decoded.id,
            username: decoded.username,
            rol: decoded.rol,
            encargadoId: decoded.encargadoId
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expirado',
                mensaje: 'La sesión ha expirado, inicia sesión nuevamente' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Token inválido',
                mensaje: 'El token proporcionado no es válido' 
            });
        }

        return res.status(500).json({ 
            error: 'Error de autenticación',
            mensaje: error.message 
        });
    }
};

/**
 * Middleware para verificar que el usuario tiene uno de los roles permitidos
 * @param  {...string} rolesPermitidos - Lista de roles permitidos
 */
export const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ 
                error: 'No autorizado',
                mensaje: 'Usuario no autenticado' 
            });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ 
                error: 'Acceso denegado',
                mensaje: `Esta acción requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}` 
            });
        }

        next();
    };
};

/**
 * Middleware específico: solo administradores
 */
export const soloAdmin = verificarRol('admin');

/**
 * Middleware específico: administradores y encargados de suministro
 */
export const soloEncargados = verificarRol('admin', 'encargado_suministro');

/**
 * Middleware específico: usuarios autenticados (cualquier rol)
 */
export const soloAutenticados = verificarToken;

/**
 * Generar token JWT
 * @param {Object} usuario - Datos del usuario
 * @returns {string} Token JWT
 */
export const generarToken = (usuario) => {
    const payload = {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        encargadoId: usuario.encargadoId || null
    };

    // Token válido por 8 horas
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
};
