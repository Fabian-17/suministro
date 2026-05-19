import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SolicitudPrintView from '../components/SolicitudPrintView';
import API_URL from '../config/api';
import '../styles/Solicitudes.css';

const SolicitudesAprobadasPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [fechaSalida, setFechaSalida] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [solicitudParaImprimir, setSolicitudParaImprimir] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    cargarSolicitudes();
    // Fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    setFechaSalida(hoy);
  }, [token]);

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/solicitudes/aprobadas`, {
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

  const abrirModalProcesar = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setSolicitudSeleccionada(null);
  };

  const handleProcesar = async () => {
    if (!fechaSalida) {
      alert('Debes seleccionar una fecha');
      return;
    }

    setProcesando(true);

    try {
      const response = await fetch(`${API_URL}/solicitudes/${solicitudSeleccionada.id}/procesar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fecha: fechaSalida }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al procesar solicitud');
      }

      const data = await response.json();
      alert(`✅ Solicitud procesada correctamente\n${data.salidas.length} salida(s) generada(s)`);
      cerrarModal();
      cargarSolicitudes();
    } catch (err) {
      alert('❌ ' + err.message);
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return <div className="loading">Cargando solicitudes aprobadas...</div>;
  }

  return (
    <div className="solicitudes-container">
      <div className="solicitudes-header">
        <h1>✅ Solicitudes Aprobadas</h1>
        <button onClick={cargarSolicitudes} className="btn-secondary">
          🔄 Actualizar
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {solicitudes.length === 0 ? (
        <div className="empty-state">
          <p>No hay solicitudes aprobadas pendientes de procesar</p>
        </div>
      ) : (
        <div className="solicitudes-lista">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="solicitud-card">
              <div className="card-header">
                <div className="card-info">
                  <h3>Solicitud #{solicitud.id}</h3>
                  <span className="badge badge-aprobada">✅ Aprobada</span>
                </div>
                <div className="card-fecha">
                  Aprobada: {new Date(solicitud.fecha_aprobada).toLocaleString('es-ES')}
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
                  <h4>Artículos Aprobados:</h4>
                  <table className="items-table-small">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Artículo</th>
                        <th>Cantidad Aprobada</th>
                        <th>Stock Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitud.items
                        ?.filter((item) => item.cantidad_aprobada > 0)
                        .map((item) => (
                          <tr
                            key={item.id}
                            className={item.cantidad_aprobada > (item.inventario?.cantidad || 0) ? 'sin-stock' : ''}
                          >
                            <td>{item.codigo}</td>
                            <td>{item.articulo}</td>
                            <td>{item.cantidad_aprobada}</td>
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
                <button onClick={() => abrirModalProcesar(solicitud)} className="btn-primary">
                  🎉 Procesar y Generar Salidas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Procesamiento */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎉 Procesar Solicitud</h2>
              <button className="modal-close" onClick={cerrarModal}>
                ×
              </button>
            </div>

            <div className="aprobacion-form">
              <p>
                <strong>Solicitud #{solicitudSeleccionada?.id}</strong>
              </p>
              <p>
                Esta acción generará automáticamente las salidas de inventario para cada artículo aprobado.
              </p>

              <div className="items-preview" style={{ marginBottom: '1.5rem' }}>
                <h4>Se generarán {solicitudSeleccionada?.items?.filter(i => i.cantidad_aprobada > 0).length || 0} salida(s):</h4>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                  {solicitudSeleccionada?.items
                    ?.filter((i) => i.cantidad_aprobada > 0)
                    .map((item) => (
                      <li key={item.id}>
                        {item.articulo} - Cantidad: {item.cantidad_aprobada}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="form-group">
                <label htmlFor="fechaSalida">
                  <strong>Fecha de salida:</strong>
                </label>
                <input
                  type="date"
                  id="fechaSalida"
                  value={fechaSalida}
                  onChange={(e) => setFechaSalida(e.target.value)}
                  className="input-cantidad"
                  style={{ width: '100%', padding: '0.75rem' }}
                />
              </div>

              <div className="form-actions">
                <button onClick={cerrarModal} className="btn-secondary" disabled={procesando}>
                  Cancelar
                </button>
                <button onClick={handleProcesar} className="btn-primary" disabled={procesando}>
                  {procesando ? 'Procesando...' : 'Confirmar y Procesar'}
                </button>
              </div>
            </div>
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

export default SolicitudesAprobadasPage;
