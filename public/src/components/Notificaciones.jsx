import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import '../styles/Notificaciones.css';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [contador, setContador] = useState(0);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [cargando, setCargando] = useState(false);
  const { socket, conectado } = useSocket();
  const { token } = useAuth();
  const panelRef = useRef(null);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (token) {
      cargarNotificaciones();
      cargarContador();
    }
  }, [token]);

  // Escuchar eventos de Socket.io
  useEffect(() => {
    if (!socket || !conectado) return;

    const handleNuevaNotificacion = (data) => {
      console.log('📬 Nueva notificación:', data);
      setNotificaciones((prev) => [data, ...prev]);
      setContador((prev) => prev + 1);
      
      // Reproducir sonido o mostrar notificación del navegador
      mostrarNotificacionNavegador(data.titulo, data.mensaje);
    };

    socket.on('notificacion:nueva', handleNuevaNotificacion);

    return () => {
      socket.off('notificacion:nueva', handleNuevaNotificacion);
    };
  }, [socket, conectado]);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setMostrarPanel(false);
      }
    };

    if (mostrarPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarPanel]);

  const cargarNotificaciones = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/notificaciones/no-leidas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setNotificaciones(data.notificaciones || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarContador = async () => {
    try {
      const response = await fetch(`${API_URL}/notificaciones/contador`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setContador(data.count || 0);
    } catch (error) {
      console.error('Error al cargar contador:', error);
    }
  };

  const marcarComoLeida = async (id) => {
    try {
      await fetch(`${API_URL}/notificaciones/${id}/leer`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      setContador((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await fetch(`${API_URL}/notificaciones/leer-todas`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotificaciones([]);
      setContador(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const mostrarNotificacionNavegador = (titulo, mensaje) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titulo, { body: mensaje });
    }
  };

  const togglePanel = () => {
    setMostrarPanel(!mostrarPanel);
    if (!mostrarPanel) {
      cargarNotificaciones();
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'solicitud_nueva':
        return '📦';
      case 'solicitud_aprobada':
        return '✅';
      case 'solicitud_rechazada':
        return '❌';
      case 'solicitud_procesada':
        return '🎉';
      default:
        return '🔔';
    }
  };

  return (
    <div className="notificaciones-container" ref={panelRef}>
      <button className="notificaciones-btn" onClick={togglePanel}>
        🔔
        {contador > 0 && <span className="badge">{contador > 99 ? '99+' : contador}</span>}
      </button>

      {mostrarPanel && (
        <div className="notificaciones-panel">
          <div className="panel-header">
            <h3>Notificaciones</h3>
            {notificaciones.length > 0 && (
              <button className="btn-marcar-todas" onClick={marcarTodasComoLeidas}>
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="panel-body">
            {cargando ? (
              <div className="panel-loading">Cargando...</div>
            ) : notificaciones.length === 0 ? (
              <div className="panel-empty">No hay notificaciones nuevas</div>
            ) : (
              <div className="notificaciones-lista">
                {notificaciones.map((notif) => (
                  <div key={notif.id} className="notificacion-item">
                    <div className="notif-icon">{getTipoIcon(notif.tipo)}</div>
                    <div className="notif-content">
                      <div className="notif-titulo">{notif.titulo}</div>
                      <div className="notif-mensaje">{notif.mensaje}</div>
                      <div className="notif-fecha">
                        {new Date(notif.createdAt).toLocaleString('es-ES')}
                      </div>
                    </div>
                    <button
                      className="btn-marcar-leida"
                      onClick={() => marcarComoLeida(notif.id)}
                      title="Marcar como leída"
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
