import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import API_URL from '../config/api';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const { token, usuario, estaAutenticado } = useAuth();

  useEffect(() => {
    if (!estaAutenticado || !token || !usuario) {
      // Si no está autenticado, desconectar socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConectado(false);
      }
      return;
    }

    // Crear conexión Socket.io
    const socketInstance = io(API_URL, {
      auth: { token },
      autoConnect: false,
    });

    // Eventos de conexión
    socketInstance.on('connect', () => {
      console.log('🔌 Socket conectado:', socketInstance.id);
      setConectado(true);

      // Autenticarse
      socketInstance.emit('authenticate', {
        token,
        usuario: {
          id: usuario.id,
          username: usuario.username,
          rol: usuario.rol,
        },
      });
    });

    socketInstance.on('authenticated', (data) => {
      console.log('✅ Autenticado en Socket.io:', data);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket desconectado');
      setConectado(false);
    });

    socketInstance.on('error', (error) => {
      console.error('❌ Error en Socket.io:', error);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
    });

    // Conectar
    socketInstance.connect();
    setSocket(socketInstance);

    // Cleanup
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [estaAutenticado, token, usuario]);

  const value = {
    socket,
    conectado,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
