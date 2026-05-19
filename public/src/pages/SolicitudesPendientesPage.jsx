import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import SolicitudPrintView from '../components/SolicitudPrintView';
import API_URL from '../config/api';
import '../styles/Solicitudes.css';

const SolicitudesPendientesPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [accion, setAccion] = useState(null); // 'aprobar' o 'rechazar'
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [itemsAprobados, setItemsAprobados] = useState([]);
  const [solicitudParaImprimir, setSolicitudParaImprimir] = useState(null);
  const { token } = useAuth();
  const { socket, conectado } = useSocket();

  useEffect(() => {
    cargarSolicitudes();
  }, [token]);

  // Escuchar nuevas solicitudes en tiempo real
  useEffect(() => {
    if (!socket || !conectado) return;

    const handleNuevaSolicitud = (data) => {
      console.log('📦 Nueva solicitud recibida:', data);
      cargarSolicitudes();
    };

    socket.on('solicitud:nueva', handleNuevaSolicitud);

    return () => {
      socket.off('solicitud:nueva', handleNuevaSolicitud);
    };
  }, [socket, conectado]);

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/solicitudes/pendientes`, {
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

  const abrirModalAprobar = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setAccion('aprobar');
    // Inicializar cantidades aprobadas = cantidades solicitadas
    setItemsAprobados(
      solicitud.items.map((item) => ({
        id: item.id,
        cantidad_aprobada: item.cantidad_solicitada,
        max: Math.min(item.cantidad_solicitada, item.inventario?.cantidad || 0),
      }))
    );
    setModalAbierto(true);
  };

  const abrirModalRechazar = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setAccion('rechazar');
    setMotivoRechazo('');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setSolicitudSeleccionada(null);
    setAccion(null);
    setMotivoRechazo('');
    setItemsAprobados([]);
  };

  const actualizarCantidadAprobada = (itemId, cantidad) => {
    setItemsAprobados((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, cantidad_aprobada: Math.max(0, Math.min(cantidad, item.max)) }
          : item
      )
    );
  };

  const handleAprobar = async () => {
    try {
      const response = await fetch(`${API_URL}/solicitudes/${solicitudSeleccionada.id}/aprobar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: itemsAprobados }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al aprobar solicitud');
      }

      alert('✅ Solicitud aprobada correctamente');
      cerrarModal();
      cargarSolicitudes();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert('Debes proporcionar un motivo de rechazo');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/solicitudes/${solicitudSeleccionada.id}/rechazar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo: motivoRechazo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al rechazar solicitud');
      }

      alert('✅ Solicitud rechazada');
      cerrarModal();
      cargarSolicitudes();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  if (cargando) {
    return <div className="loading">Cargando solicitudes pendientes...</div>;
  }

  return (
    <div className="solicitudes-container">
      <div className="solicitudes-header">
        <h1>⏳ Solicitudes Pendientes</h1>
        <button onClick={cargarSolicitudes} className="btn-secondary">
          🔄 Actualizar
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {solicitudes.length === 0 ? (
        <div className="empty-state">
          <p>No hay solicitudes pendientes</p>
        </div>
      ) : (
        <div className="solicitudes-lista">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="solicitud-card">
              <div className="card-header">
                <div className="card-info">
                  <h3>Solicitud #{solicitud.id}</h3>
                  <span className="badge badge-pendiente">⏳ Pendiente</span>
                </div>
                <div className="card-fecha">
                  {new Date(solicitud.fecha_solicitud).toLocaleString('es-ES')}
                </div>
              </div>

              <div className="card-body">
                <p>
                  <strong>Solicitante:</strong> {solicitud.usuario?.username || 'N/A'}
                  {solicitud.usuario?.encargado && ` (${solicitud.usuario.encargado.nombre})`}
                </p>
                <p>
                  <strong>Área:</strong> {solicitud.area?.nombre || 'N/A'}
                </p>
                {solicitud.observaciones && (
                  <p>
                    <strong>Observaciones:</strong> {solicitud.observaciones}
                  </p>
                )}

                <div className="items-preview">
                  <h4>Artículos Solicitados:</h4>
                  <table className="items-table-small">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Artículo</th>
                        <th>Solicitado</th>
                        <th>Stock Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitud.items?.map((item) => (
                        <tr
                          key={item.id}
                          className={item.cantidad_solicitada > (item.inventario?.cantidad || 0) ? 'sin-stock' : ''}
                        >
                          <td>{item.codigo}</td>
                          <td>{item.articulo}</td>
                          <td>{item.cantidad_solicitada}</td>
                          <td>{item.inventario?.cantidad || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card-actions">
                <button onClick={() => setSolicitudParaImprimir(solicitud)} className="btn-secondary">
                  🖨️ Ver/Imprimir
                </button>
                <button onClick={() => abrirModalRechazar(solicitud)} className="btn-danger">
                  ❌ Rechazar
                </button>
                <button onClick={() => abrirModalAprobar(solicitud)} className="btn-success">
                  ✅ Aprobar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Aprobación/Rechazo */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{accion === 'aprobar' ? '✅ Aprobar Solicitud' : '❌ Rechazar Solicitud'}</h2>
              <button className="modal-close" onClick={cerrarModal}>
                ×
              </button>
            </div>

            {accion === 'aprobar' ? (
              <div className="aprobacion-form">
                <p>
                  <strong>Solicitud #{solicitudSeleccionada?.id}</strong>
                </p>
                <p>Puedes aprobar parcialmente modificando las cantidades:</p>

                <div className="aprobacion-items">
                  {solicitudSeleccionada?.items?.map((item) => {
                    const itemAprobado = itemsAprobados.find((i) => i.id === item.id);
                    return (
                      <div key={item.id} className="aprobacion-item">
                        <div className="aprobacion-item-info">
                          <strong>{item.articulo}</strong>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Solicitado: {item.cantidad_solicitada} | Stock: {item.inventario?.cantidad || 0}
                          </div>
                        </div>
                        <div className="aprobacion-item-cantidad">
                          <label>Aprobar:</label>
                          <input
                            type="number"
                            min="0"
                            max={itemAprobado?.max}
                            value={itemAprobado?.cantidad_aprobada || 0}
                            onChange={(e) =>
                              actualizarCantidadAprobada(item.id, parseInt(e.target.value) || 0)
                            }
                            className="input-cantidad"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="form-actions">
                  <button onClick={cerrarModal} className="btn-secondary">
                    Cancelar
                  </button>
                  <button onClick={handleAprobar} className="btn-success">
                    Confirmar Aprobación
                  </button>
                </div>
              </div>
            ) : (
              <div className="aprobacion-form">
                <p>
                  <strong>Solicitud #{solicitudSeleccionada?.id}</strong>
                </p>
                <p>Proporciona un motivo de rechazo:</p>

                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Ejemplo: Stock insuficiente, solicitar la próxima semana..."
                  rows={4}
                  className="textarea-observaciones"
                  autoFocus
                />

                <div className="form-actions">
                  <button onClick={cerrarModal} className="btn-secondary">
                    Cancelar
                  </button>
                  <button onClick={handleRechazar} className="btn-danger">
                    Confirmar Rechazo
                  </button>
                </div>
              </div>
            )}
          </div>
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

export default SolicitudesPendientesPage;
