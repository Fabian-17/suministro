import { 
    obtenerTodosUsuarios, 
    obtenerUsuarioPorId, 
    crearUsuario, 
    actualizarUsuario, 
    eliminarUsuario,
    activarUsuario,
    obtenerUsuariosPorRol
} from '../services/usuarios.service.js';

/**
 * Controlador: Obtener todos los usuarios
 * GET /usuarios
 */
export const obtenerUsuariosController = async (req, res) => {
    try {
        const usuarios = await obtenerTodosUsuarios();
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: error.message 
        });
    }
};

/**
 * Controlador: Obtener usuario por ID
 * GET /usuarios/:id
 */
export const obtenerUsuarioController = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await obtenerUsuarioPorId(id);
        return res.status(200).json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ 
                error: 'No encontrado',
                mensaje: error.message 
            });
        }

        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: error.message 
        });
    }
};

/**
 * Controlador: Crear nuevo usuario
 * POST /usuarios
 */
export const crearUsuarioController = async (req, res) => {
    try {
        const { username, password, rol, encargadoId } = req.body;

        // Validaciones
        if (!username || !password || !rol) {
            return res.status(400).json({ 
                error: 'Datos incompletos',
                mensaje: 'Username, password y rol son requeridos' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Contraseña débil',
                mensaje: 'La contraseña debe tener al menos 6 caracteres' 
            });
        }

        const rolesValidos = ['admin', 'encargado_suministro', 'solicitante'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({ 
                error: 'Rol inválido',
                mensaje: `El rol debe ser uno de: ${rolesValidos.join(', ')}` 
            });
        }

        // Crear usuario
        const nuevoUsuario = await crearUsuario({ 
            username, 
            password, 
            rol, 
            encargadoId 
        });

        return res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: nuevoUsuario
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        
        if (error.message.includes('ya existe') || error.message.includes('vinculado')) {
            return res.status(400).json({ 
                error: 'Error de validación',
                mensaje: error.message 
            });
        }

        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: error.message 
        });
    }
};

/**
 * Controlador: Actualizar usuario
 * PUT /usuarios/:id
 */
export const actualizarUsuarioController = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Validar rol si se proporciona
        if (data.rol) {
            const rolesValidos = ['admin', 'encargado_suministro', 'solicitante'];
            if (!rolesValidos.includes(data.rol)) {
                return res.status(400).json({ 
                    error: 'Rol inválido',
                    mensaje: `El rol debe ser uno de: ${rolesValidos.join(', ')}` 
                });
            }
        }

        // Validar contraseña si se proporciona
        if (data.password && data.password.length < 6) {
            return res.status(400).json({ 
                error: 'Contraseña débil',
                mensaje: 'La contraseña debe tener al menos 6 caracteres' 
            });
        }

        // Actualizar usuario
        const usuarioActualizado = await actualizarUsuario(id, data);

        return res.status(200).json({
            mensaje: 'Usuario actualizado exitosamente',
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ 
                error: 'No encontrado',
                mensaje: error.message 
            });
        }

        if (error.message.includes('ya existe') || error.message.includes('vinculado')) {
            return res.status(400).json({ 
                error: 'Error de validación',
                mensaje: error.message 
            });
        }

        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: error.message 
        });
    }
};

/**
 * Controlador: Eliminar (desactivar) usuario
 * DELETE /usuarios/:id
 */
export const eliminarUsuarioController = async (req, res) => {
    try {
        const { id } = req.params;

        // No permitir que un usuario se elimine a sí mismo
        if (parseInt(id) === req.usuario.id) {
            return res.status(400).json({ 
                error: 'Acción no permitida',
                mensaje: 'No puedes eliminar tu propia cuenta' 
            });
        }

        const resultado = await eliminarUsuario(id);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ 
                error: 'No encontrado',
                mensaje: error.message 
            });
        }

        if (error.message.includes('último administrador')) {
            return res.status(400).json({ 
                error: 'Acción no permitida',
                mensaje: error.message 
            });
        }

        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: error.message 
        });
    }
};

/**
 * Controlador: Activar usuario
 * PUT /usuarios/:id/activar
 */
export const activarUsuarioController = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await activarUsuario(id);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al activar usuario:', error);
        
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ 
                error: 'No encontrado',
                mensaje: error.message 
            });
        }

        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: error.message 
        });
    }
};

/**
 * Controlador: Obtener usuarios por rol
 * GET /usuarios/rol/:rol
 */
export const obtenerUsuariosPorRolController = async (req, res) => {
    try {
        const { rol } = req.params;

        const rolesValidos = ['admin', 'encargado_suministro', 'solicitante'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({ 
                error: 'Rol inválido',
                mensaje: `El rol debe ser uno de: ${rolesValidos.join(', ')}` 
            });
        }

        const usuarios = await obtenerUsuariosPorRol(rol);
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios por rol:', error);
        return res.status(500).json({ 
            error: 'Error del servidor',
            mensaje: error.message 
        });
    }
};
