import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NuevaSalida from './NuevaSalida';
import { generarReportePDF } from '../components/reportes';
import { useToast } from '../context/ToastContext.jsx';
import API_URL from '../config/api';

const SalidasPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showHistorial, setShowHistorial] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedDestinatario, setSelectedDestinatario] = useState('');
  const [salidas, setSalidas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yearsAvailable, setYearsAvailable] = useState([]);

  // Formatear fecha a dd-mm-yyyy
  function formatFecha(fechaStr) {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.slice(0,10).split('-');
    return `${d}-${m}-${y}`;
  }

  // Cargar años disponibles cuando se abre el historial
  const cargarYearsDisponibles = async () => {
    try {
      const res = await fetch(`${API_URL}/salidas`);
      const data = await res.json();
      const years = [...new Set(data.map(s => s.fecha ? new Date(s.fecha).getFullYear() : null).filter(Boolean))];
      setYearsAvailable(years.sort((a, b) => b - a));
    } catch (err) {
      console.error('Error cargando años:', err);
    }
  };

  // Buscar salidas con filtros
  const buscarSalidas = async () => {
    if (!selectedMonth || !selectedYear) {
      showToast('Debes seleccionar mes y año', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/salidas`);
      const data = await res.json();
      
      // Filtrar por mes/año
      let filtered = data.filter(s => {
        if (!s.fecha) return false;
        const date = new Date(s.fecha);
        return date.getMonth() + 1 === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
      });

      // Filtrar por área si está seleccionada
      if (selectedArea) {
        filtered = filtered.filter(s => s.area === selectedArea);
      }

      // Filtrar por destinatario si está seleccionado
      if (selectedDestinatario) {
        filtered = filtered.filter(s => s.destinatario === selectedDestinatario);
      }

      // Ordenar por fecha descendente
      filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      setSalidas(filtered);
      if (filtered.length === 0) {
        showToast('No se encontraron salidas con esos filtros', 'info');
      } else {
        showToast(`Se encontraron ${filtered.length} salida(s)`, 'success');
      }
    } catch (err) {
      showToast('Error al cargar salidas: ' + err.message, 'error');
      setSalidas([]);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSelectedMonth('');
    setSelectedYear('');
    setSelectedArea('');
    setSelectedDestinatario('');
    setSalidas([]);
  };

  // Agrupar salidas por área y destinatario para PDF
  const getGroupedSalidas = () => {
    const grupos = {};
    salidas.forEach(s => {
      const area = s.area || 'Sin área';
      const destinatario = s.destinatario || 'Sin destinatario';
      
      if (!grupos[area]) grupos[area] = {};
      if (!grupos[area][destinatario]) grupos[area][destinatario] = [];
      
      grupos[area][destinatario].push(s);
    });
    return grupos;
  };

  // Agrupar salidas solo por destinatario para vista
  const getGroupedSalidasPorDestinatario = () => {
    const grupos = {};
    salidas.forEach(s => {
      const destinatario = s.destinatario || 'Sin destinatario';
      if (!grupos[destinatario]) grupos[destinatario] = [];
      grupos[destinatario].push(s);
    });
    return grupos;
  };
  return (
    <div className="page" style={{ position: 'relative' }}>
      {/* Flecha para retroceder */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          fontSize: '1rem',
          color: '#1976d2',
          fontWeight: 600
        }}
        aria-label="Volver"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
          <path d="M15 18L9 12L15 6" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Gestión de Salidas</h2>
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            setShowHistorial(true);
            if (yearsAvailable.length === 0) cargarYearsDisponibles();
          }}
        >
          📊 Ver Historial
        </button>
      </div>

      {/* Formulario de nueva salida (siempre visible) */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
        padding: '32px 40px',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <h3 style={{ marginBottom: 24, color: '#1976d2' }}>Registrar Nueva Salida</h3>
        <NuevaSalida />
      </div>

      {/* Modal de Historial */}
      {showHistorial && (
        <div 
          className="modal-overlay" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0,0,0,0.5)', 
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto'
          }} 
          onClick={() => setShowHistorial(false)}
        >
          <div 
            style={{ 
              background: '#fff', 
              borderRadius: 12, 
              maxWidth: '95%',
              width: 1400,
              maxHeight: '95vh',
              overflow: 'auto',
              position: 'relative',
              margin: 20
            }} 
            onClick={e => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div style={{ 
              position: 'sticky', 
              top: 0, 
              background: '#fff', 
              borderBottom: '2px solid #e0e0e0',
              padding: '20px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10
            }}>
              <h3 style={{ margin: 0, color: '#1976d2' }}>Historial de Salidas</h3>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: 24, 
                  cursor: 'pointer',
                  color: '#666'
                }} 
                onClick={() => setShowHistorial(false)}
              >
                ✕
              </button>
            </div>

            {/* Filtros */}
            <div style={{ padding: '24px 32px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '0 0 auto' }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Mes *</label>
                  <select 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }}
                  >
                    <option value="">Seleccionar</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>
                        {new Date(2000, i, 1).toLocaleString('es', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: '0 0 auto' }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Año *</label>
                  <select 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }}
                  >
                    <option value="">Seleccionar</option>
                    {yearsAvailable.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: '0 0 auto' }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Área (opcional)</label>
                  <input 
                    type="text"
                    value={selectedArea}
                    onChange={e => setSelectedArea(e.target.value)}
                    placeholder="Filtrar por área"
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
                  />
                </div>

                <div style={{ flex: '0 0 auto' }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Destinatario (opcional)</label>
                  <input 
                    type="text"
                    value={selectedDestinatario}
                    onChange={e => setSelectedDestinatario(e.target.value)}
                    placeholder="Filtrar por destinatario"
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', minWidth: 200 }}
                  />
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={buscarSalidas}
                  disabled={loading}
                  style={{ padding: '8px 24px' }}
                >
                  {loading ? '🔍 Buscando...' : '🔍 Buscar'}
                </button>

                <button 
                  className="btn btn-outline"
                  onClick={limpiarFiltros}
                  style={{ padding: '8px 24px' }}
                >
                  🔄 Limpiar
                </button>

                {salidas.length > 0 && (
                  <button 
                    className="btn btn-success"
                    onClick={() => generarReportePDF(getGroupedSalidas(), selectedMonth, selectedYear)}
                    style={{ padding: '8px 24px', marginLeft: 'auto' }}
                  >
                    📄 Exportar PDF
                  </button>
                )}
              </div>
              <p style={{ margin: '12px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                * Mes y año son obligatorios
              </p>
            </div>

            {/* Resultados */}
            <div style={{ padding: '24px 32px', minHeight: 300 }}>
              {salidas.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '80px 20px', 
                  color: '#999',
                  fontSize: '1.1rem'
                }}>
                  {loading ? '⏳ Cargando...' : '📋 Selecciona los filtros y haz clic en "Buscar" para ver las salidas'}
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#333' }}>
                      Resultados: {salidas.length} salida(s) encontrada(s)
                    </h4>
                  </div>

                  {/* Vista agrupada por destinatario */}
                  {Object.entries(getGroupedSalidasPorDestinatario()).map(([destinatario, items]) => (
                    <div key={destinatario} style={{
                      marginBottom: 32,
                      border: '1px solid #e0e0e0',
                      borderRadius: 10,
                      background: '#f8f9fa',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        background: '#1976d2', 
                        color: 'white', 
                        padding: '12px 20px',
                        fontSize: '1.1rem', 
                        fontWeight: 700
                      }}>
                        👤 {destinatario} ({items.length} salida{items.length !== 1 ? 's' : ''})
                      </div>
                      <div style={{ padding: 16 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                          <thead>
                            <tr style={{ background: '#e3f2fd' }}>
                              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Fecha</th>
                              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Artículo</th>
                              <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600 }}>Cantidad</th>
                              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Área</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map(salida => (
                              <tr key={salida.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={{ padding: '10px 12px' }}>{formatFecha(salida.fecha)}</td>
                                <td style={{ padding: '10px 12px' }}>{salida.articulo}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1976d2', fontWeight: 600 }}>{salida.cantidad}</td>
                                <td style={{ padding: '10px 12px' }}>{salida.area}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalidasPage;