import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generarReportePDF } from '../components/reportes';
import { useToast } from '../context/ToastContext.jsx';
import API_URL from '../config/api';

const SalidasPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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

  // Cargar años disponibles y salidas del mes actual al montar
  useEffect(() => {
    cargarYearsDisponibles();
    buscarSalidas();
  }, []);

  // Cargar años disponibles
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
    <div className="page">
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

      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
        padding: '24px 32px',
        marginBottom: 20
      }}>
        <h2 style={{ margin: 0, marginBottom: 24, color: '#1976d2' }}>Historial de Salidas</h2>
        
        {/* Filtros */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: 8,
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Mes</label>
              <select 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', minWidth: 150 }}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>
                    {new Date(2000, i, 1).toLocaleString('es', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '0 0 auto' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Año</label>
              <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }}
              >
                {yearsAvailable.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '0 0 auto' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Área (opcional)</label>
              <input
                type="text"
                placeholder="Ej: Almacén"
                value={selectedArea}
                onChange={e => setSelectedArea(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', minWidth: 150 }}
              />
            </div>

            <div style={{ flex: '0 0 auto' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Destinatario (opcional)</label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                value={selectedDestinatario}
                onChange={e => setSelectedDestinatario(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', minWidth: 150 }}
              />
            </div>

            <button 
              className="btn btn-primary" 
              onClick={buscarSalidas}
              disabled={loading}
              style={{ padding: '8px 20px' }}
            >
              {loading ? '🔄 Buscando...' : '🔍 Buscar'}
            </button>

            <button 
              className="btn btn-secondary" 
              onClick={limpiarFiltros}
              style={{ padding: '8px 20px' }}
            >
              🗑️ Limpiar
            </button>

            {salidas.length > 0 && (
              <button
                className="btn btn-success"
                onClick={() => generarReportePDF(getGroupedSalidas(), selectedMonth, selectedYear)}
                style={{ padding: '8px 20px' }}
              >
                📄 Descargar PDF
              </button>
            )}
          </div>

          {salidas.length > 0 && (
            <div style={{ 
              marginTop: 16, 
              padding: '12px 16px', 
              background: '#e3f2fd',
              borderRadius: 6,
              fontSize: '0.95rem',
              color: '#1976d2',
              fontWeight: 600
            }}>
              📊 {salidas.length} salida(s) encontrada(s)
            </div>
          )}
        </div>

        {/* Resultados */}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px', 
            color: '#999',
            fontSize: '1.1rem'
          }}>
            ⏳ Cargando salidas...
          </div>
        ) : salidas.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px', 
            color: '#999',
            fontSize: '1.1rem'
          }}>
            📋 No hay salidas registradas para este período
          </div>
        ) : (
          <div>
            {/* Vista agrupada por destinatario */}
            {Object.entries(getGroupedSalidasPorDestinatario()).map(([destinatario, items]) => (
              <div key={destinatario} style={{
                marginBottom: 24,
                border: '1px solid #e0e0e0',
                borderRadius: 10,
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  background: '#1976d2', 
                  color: 'white', 
                  padding: '12px 20px',
                  fontSize: '1.05rem', 
                  fontWeight: 700
                }}>
                  👤 {destinatario} ({items.length} salida{items.length !== 1 ? 's' : ''})
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                      <tr style={{ background: '#e3f2fd' }}>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Fecha</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Artículo</th>
                        <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600 }}>Código</th>
                        <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600 }}>Cantidad</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Área</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(salida => (
                        <tr key={salida.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ padding: '10px 12px' }}>{formatFecha(salida.fecha)}</td>
                          <td style={{ padding: '10px 12px' }}>{salida.articulo}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>{salida.codigo}</td>
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
  );
};

export default SalidasPage;