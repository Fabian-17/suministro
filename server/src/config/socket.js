import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'suministro_secret_key_change_in_production';

let io;

/**
 * Inicializar Socket.io
 * @param {Object} httpServer - Servidor HTTP de Express
 * @returns {Object} Instancia de Socket.io
 */
export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('✅ Usuario conectado:', socket.id);

        /**
         * Evento: Autenticación del usuario
         * El frontend envía el usuario después de conectarse
         */
        socket.on('authenticate', (data) => {
            try {
                const { token, usuario } = data;

                // Verificar token (opcional, para mayor seguridad)
                if (token) {
                    try {
                        jwt.verify(token, JWT_SECRET);
                    } catch (error) {
                        console.error('Token inválido en Socket.io:', error);
                        socket.emit('error', { mensaje: 'Token inválido' });
                        return;
                    }
                }

                if (!usuario || !usuario.id || !usuario.rol) {
                    console.error('Datos de usuario inválidos');
                    return;
                }

                // Unir al usuario a su room personal
                socket.join(`user-${usuario.id}`);
                console.log(`👤 Usuario ${usuario.id} (${usuario.username}) unido a room personal`);

                // Unir a rooms según rol
                if (usuario.rol === 'encargado_suministro' || usuario.rol === 'admin') {
                    socket.join('encargados');
                    console.log(`👔 Usuario ${usuario.id} unido a room 'encargados'`);
                }

                // Confirmar autenticación
                socket.emit('authenticated', { 
                    mensaje: 'Autenticado exitosamente',
                    rooms: Array.from(socket.rooms)
                });
            } catch (error) {
                console.error('Error en autenticación Socket.io:', error);
                socket.emit('error', { mensaje: 'Error de autenticación' });
            }
        });

        /**
         * Evento: Desconexión
         */
        socket.on('disconnect', (reason) => {
            console.log('❌ Usuario desconectado:', socket.id, 'Razón:', reason);
        });

        /**
         * Evento: Error
         */
        socket.on('error', (error) => {
            console.error('Error en Socket.io:', error);
        });
    });

    console.log('🔌 Socket.io inicializado correctamente');
    return io;
};

/**
 * Obtener instancia de Socket.io
 * @returns {Object} Instancia de Socket.io
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io no ha sido inicializado. Llama a initializeSocket primero.');
    }
    return io;
};

/**
 * Emitir evento a un usuario específico
 * @param {number} usuarioId - ID del usuario
 * @param {string} evento - Nombre del evento
 * @param {Object} data - Datos a enviar
 */
export const emitirAUsuario = (usuarioId, evento, data) => {
    if (!io) {
        console.warn('Socket.io no inicializado, no se pudo emitir evento');
        return;
    }
    io.to(`user-${usuarioId}`).emit(evento, data);
};

/**
 * Emitir evento a encargados y admins
 * @param {string} evento - Nombre del evento
 * @param {Object} data - Datos a enviar
 */
export const emitirAEncargados = (evento, data) => {
    if (!io) {
        console.warn('Socket.io no inicializado, no se pudo emitir evento');
        return;
    }
    io.to('encargados').emit(evento, data);
};

/**
 * Emitir evento a todos los usuarios conectados
 * @param {string} evento - Nombre del evento
 * @param {Object} data - Datos a enviar
 */
export const emitirATodos = (evento, data) => {
    if (!io) {
        console.warn('Socket.io no inicializado, no se pudo emitir evento');
        return;
    }
    io.emit(evento, data);
};
