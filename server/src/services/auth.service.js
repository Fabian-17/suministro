import bcrypt from 'bcryptjs';
import { Usuarios } from '../models/usuarios.js';
import { Encargados } from '../models/encargados.js';
import { Areas } from '../models/areas.js';
import { generarToken } from '../middlewares/auth.js';

/**
 * Servicio de autenticación
 * Login de usuario
 */
export const loginService = async (username, password) => {
    try {
        // Buscar usuario por username
        const usuario = await Usuarios.findOne({
            where: { username },
            include: [
                {
                    model: Encargados,
                    as: 'encargado',
                    required: false,
                    include: [
                        {
                            model: Areas,
                            as: 'areas',
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });

        if (!usuario) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        // Verificar si el usuario está activo
        if (!usuario.activo) {
            throw new Error('Usuario desactivado. Contacta al administrador');
        }

        // Verificar contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password);
        
        if (!passwordValida) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        // Generar token JWT
        const token = generarToken(usuario);

        // Preparar datos del usuario (sin password)
        const usuarioData = {
            id: usuario.id,
            username: usuario.username,
            rol: usuario.rol,
            activo: usuario.activo,
            encargado: usuario.encargado ? {
                id: usuario.encargado.id,
                nombre: usuario.encargado.nombre,
                areas: usuario.encargado.areas || []
            } : null
        };

        return {
            token,
            usuario: usuarioData
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Verificar token y obtener info del usuario
 */
export const verificarTokenService = async (usuarioId) => {
    try {
        const usuario = await Usuarios.findByPk(usuarioId, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Encargados,
                    as: 'encargado',
                    required: false,
                    include: [
                        {
                            model: Areas,
                            as: 'areas',
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });

        if (!usuario || !usuario.activo) {
            throw new Error('Usuario no encontrado o inactivo');
        }

        return usuario;
    } catch (error) {
        throw error;
    }
};

/**
 * Cambiar contraseña
 */
export const cambiarPasswordService = async (usuarioId, passwordActual, passwordNueva) => {
    try {
        const usuario = await Usuarios.findByPk(usuarioId);

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar contraseña actual
        const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
        
        if (!passwordValida) {
            throw new Error('Contraseña actual incorrecta');
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(passwordNueva, 10);

        // Actualizar contraseña
        await usuario.update({ password: hashedPassword });

        return { mensaje: 'Contraseña actualizada exitosamente' };
    } catch (error) {
        throw error;
    }
};
