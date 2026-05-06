import bcrypt from 'bcryptjs';
import { Usuarios } from '../models/usuarios.js';
import { Encargados } from '../models/encargados.js';
import { Areas } from '../models/areas.js';
import { Op } from 'sequelize';

/**
 * Obtener todos los usuarios
 */
export const obtenerTodosUsuarios = async () => {
    try {
        const usuarios = await Usuarios.findAll({
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
            ],
            order: [['createdAt', 'DESC']]
        });

        return usuarios;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener usuario por ID
 */
export const obtenerUsuarioPorId = async (id) => {
    try {
        const usuario = await Usuarios.findByPk(id, {
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

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        return usuario;
    } catch (error) {
        throw error;
    }
};

/**
 * Crear nuevo usuario
 */
export const crearUsuario = async (data) => {
    try {
        const { username, password, rol, encargadoId } = data;

        // Verificar que el username no exista
        const usuarioExistente = await Usuarios.findOne({ where: { username } });
        
        if (usuarioExistente) {
            throw new Error('El nombre de usuario ya existe');
        }

        // Si es solicitante, debe tener encargadoId
        if (rol === 'solicitante' && !encargadoId) {
            throw new Error('Los solicitantes deben estar vinculados a un encargado');
        }

        // Verificar que el encargado exista si se proporciona
        if (encargadoId) {
            const encargado = await Encargados.findByPk(encargadoId);
            if (!encargado) {
                throw new Error('Encargado no encontrado');
            }
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const nuevoUsuario = await Usuarios.create({
            username,
            password: hashedPassword,
            rol,
            encargadoId: encargadoId || null,
            activo: true
        });

        // Retornar usuario sin password
        const usuarioCreado = await obtenerUsuarioPorId(nuevoUsuario.id);
        return usuarioCreado;
    } catch (error) {
        throw error;
    }
};

/**
 * Actualizar usuario
 */
export const actualizarUsuario = async (id, data) => {
    try {
        const usuario = await Usuarios.findByPk(id);

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        const { username, rol, encargadoId, activo, password } = data;

        // Si se está cambiando el username, verificar que no exista
        if (username && username !== usuario.username) {
            const usuarioExistente = await Usuarios.findOne({ 
                where: { 
                    username,
                    id: { [Op.ne]: id }
                } 
            });
            
            if (usuarioExistente) {
                throw new Error('El nombre de usuario ya existe');
            }
        }

        // Si es solicitante, debe tener encargadoId
        if (rol === 'solicitante' && !encargadoId && !usuario.encargadoId) {
            throw new Error('Los solicitantes deben estar vinculados a un encargado');
        }

        // Verificar que el encargado exista si se proporciona
        if (encargadoId) {
            const encargado = await Encargados.findByPk(encargadoId);
            if (!encargado) {
                throw new Error('Encargado no encontrado');
            }
        }

        // Preparar datos para actualizar
        const datosActualizar = {};
        
        if (username) datosActualizar.username = username;
        if (rol) datosActualizar.rol = rol;
        if (encargadoId !== undefined) datosActualizar.encargadoId = encargadoId;
        if (activo !== undefined) datosActualizar.activo = activo;
        
        // Si se proporciona nueva contraseña, hashearla
        if (password) {
            datosActualizar.password = await bcrypt.hash(password, 10);
        }

        // Actualizar usuario
        await usuario.update(datosActualizar);

        // Retornar usuario actualizado sin password
        const usuarioActualizado = await obtenerUsuarioPorId(id);
        return usuarioActualizado;
    } catch (error) {
        throw error;
    }
};

/**
 * Eliminar (desactivar) usuario
 */
export const eliminarUsuario = async (id) => {
    try {
        const usuario = await Usuarios.findByPk(id);

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // No permitir eliminar el último admin
        if (usuario.rol === 'admin') {
            const totalAdmins = await Usuarios.count({ 
                where: { 
                    rol: 'admin',
                    activo: true
                } 
            });
            
            if (totalAdmins <= 1) {
                throw new Error('No se puede eliminar el único administrador activo');
            }
        }

        // Desactivar en lugar de eliminar
        await usuario.update({ activo: false });

        return { mensaje: 'Usuario desactivado exitosamente' };
    } catch (error) {
        throw error;
    }
};

/**
 * Activar usuario
 */
export const activarUsuario = async (id) => {
    try {
        const usuario = await Usuarios.findByPk(id);

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        await usuario.update({ activo: true });

        return { mensaje: 'Usuario activado exitosamente' };
    } catch (error) {
        throw error;
    }
};

/**
 * Buscar usuarios por rol
 */
export const obtenerUsuariosPorRol = async (rol) => {
    try {
        const usuarios = await Usuarios.findAll({
            where: { rol, activo: true },
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

        return usuarios;
    } catch (error) {
        throw error;
    }
};
