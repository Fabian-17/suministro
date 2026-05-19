import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import SolicitudPrintView from '../components/SolicitudPrintView';
import API_URL from '../config/api';
import '../styles/Solicitudes.css';

const MisSolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas'); // todas, pendiente, aprobada, rechazada, procesada
  const [solicitudParaImprimir, setSolicitudParaImprimir] = useState(null);
  const { token } = useAuth();
  const { socket, conectado } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    cargarSolicitudes();
  }, [token]);

  // Escuchar eventos de Socket.io
  useEffect(() => {
    if (!socket || !conectado) return;

    const handleActualizacion = () => {
      console.log('🔄 Solicitud actualizada, recargando...');
      cargarSolicitudes();
    };

    socket.on('solicitud:aprobada', handleActualizacion);
    socket.on('solicitud:rechazada', handleActualizacion);
    socket.on('solicitud:procesada', handleActualizacion);

    return () => {
      socket.off('solicitud:aprobada', handleActualizacion);
      socket.off('solicitud:rechazada', handleActualizacion);
      socket.off('solicitud:procesada', handleActualizacion);
    };
  }, [socket, conectado]);

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/solicitudes/mis-solicitudes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar solicitudes');
      }

      const data = await response.json();
      setSolicitudes(data.solicitudes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const eliminarSolicitud = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return;

    try {
      const response = await fetch(`${API_URL}/solicitudes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar solicitud');
      }

      alert('✅ Solicitud eliminada');
      cargarSolicitudes();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { clase: 'badge-pendiente', texto: '⏳ Pendiente' },
      aprobada: { clase: 'badge-aprobada', texto: '✅ Aprobada' },
      rechazada: { clase: 'badge-rechazada', texto: '❌ Rechazada' },
      procesada: { clase: 'badge-procesada', texto: '🎉 Procesada' },
    };
    return badges[estado] || { clase: '', texto: estado };
  };

  const solicitudesFiltradas = solicitudes.filter((s) => 
    filtro === 'todas' ? true : s.estado === filtro
  );

  if (cargando) {
    return <div className="loading">Cargando solicitudes...</div>;
  }

  return (
    <div className="solicitudes-container">
      <div className="solicitudes-header">
        <h1>📋 Mis Solicitudes</h1>
        <button onClick={() => navigate('/nueva-solicitud')} className="btn-primary">
          + Nueva Solicitud
        </button>
      </div>

      <div className="filtros">
        <button
          onClick={() => setFiltro('todas')}
          className={filtro === 'todas' ? 'filtro-activo' : ''}
        >
          Todas ({solicitudes.length})
        </button>
        <button
          onClick={() => setFiltro('pendiente')}
          className={filtro === 'pendiente' ? 'filtro-activo' : ''}
        >
          Pendientes ({solicitudes.filter((s) => s.estado === 'pendiente').length})
        </button>
        <button
          onClick={() => setFiltro('aprobada')}
          className={filtro === 'aprobada' ? 'filtro-activo' : ''}
        >
          Aprobadas ({solicitudes.filter((s) => s.estado === 'aprobada').length})
        </button>
        <button
          onClick={() => setFiltro('rechazada')}
          className={filtro === 'rechazada' ? 'filtro-activo' : ''}
        >
          Rechazadas ({solicitudes.filter((s) => s.estado === 'rechazada').length})
        </button>
        <button
          onClick={() => setFiltro('procesada')}
          className={filtro === 'procesada' ? 'filtro-activo' : ''}
        >
          Procesadas ({solicitudes.filter((s) => s.estado === 'procesada').length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {solicitudesFiltradas.length === 0 ? (
        <div className="empty-state">
          <p>No hay solicitudes {filtro !== 'todas' ? `en estado "${filtro}"` : ''}</p>
        </div>
      ) : (
        <div className="solicitudes-lista">
          {solicitudesFiltradas.map((solicitud) => {
            const badge = getEstadoBadge(solicitud.estado);
            return (
              <div key={solicitud.id} className="solicitud-card">
                <div className="card-header">
                  <div className="card-info">
                    <h3>Solicitud #{solicitud.id}</h3>
                    <span className={`badge ${badge.clase}`}>{badge.texto}</span>
                  </div>
                  <div className="card-fecha">
                    {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}
                  </div>
                </div>

                <div className="card-body">
                  <p>
                    <strong>Área:</strong> {solicitud.area?.nombre || 'N/A'}
                  </p>
                  {solicitud.observaciones && (
                    <p>
                      <strong>Observaciones:</strong> {solicitud.observaciones}
                    </p>
                  )}
                  {solicitud.motivo_rechazo && (
                    <p className="motivo-rechazo">
                      <strong>Motivo de rechazo:</strong> {solicitud.motivo_rechazo}
                    </p>
                  )}
                  <p>
                    <strong>Artículos:</strong> {solicitud.items?.length || 0} item(s)
                  </p>

                  {solicitud.items && solicitud.items.length > 0 && (
                    <div className="items-preview">
                      <table className="items-table-small">
                        <thead>
                          <tr>
                            <th>Artículo</th>
                            <th>Solicitado</th>
                            {solicitud.estado !== 'pendiente' && <th>Aprobado</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {solicitud.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.articulo}</td>
                              <td>{item.cantidad_solicitada}</td>
                              {solicitud.estado !== 'pendiente' && (
                                <td>{item.cantidad_aprobada || 0}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => setSolicitudParaImprimir(solicitud)}
                    className="btn-secondary"
                  >
                    🖨️ Ver/Imprimir
                  </button>
                  {solicitud.estado === 'pendiente' && (
                    <button
                      onClick={() => eliminarSolicitud(solicitud.id)}
                      className="btn-danger"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de impresión */}
      {solicitudParaImprimir && (
        <SolicitudPrintView 
          solicitud={solicitudParaImprimir}
          onClose={() => setSolicitudParaImprimir(null)}
        />
      )}
    </div>
  );
};

export default MisSolicitudesPage;
