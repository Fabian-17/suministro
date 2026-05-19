import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';

const DashboardSolicitante = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_URL}/solicitudes/mis-solicitudes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          const solicitudes = Array.isArray(data) ? data : data.solicitudes || [];
          
          setStats({
            pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
            aprobadas: solicitudes.filter(s => s.estado === 'aprobada').length,
            rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length,
            total: solicitudes.length
          });
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        background: '#fff', 
        border: '1px solid #e0e0e0',
        borderRadius: 4, 
        padding: '20px 24px',
        marginBottom: 24
      }}>
        <h1 style={{ margin: 0, color: '#333', fontSize: '1.5rem', fontWeight: 600 }}>
          Sistema de Suministros
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
          Usuario: <strong>{usuario?.encargado?.nombre || usuario?.username || 'Usuario'}</strong> | 
          Área: <strong>{usuario?.encargado?.areas?.[0]?.nombre || 'Sin asignar'}</strong>
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total de Solicitudes
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#333' }}>
            {loading ? '-' : stats.total}
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          padding: 20,
          textAlign: 'center',
          borderLeft: '3px solid #ff9800'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pendientes
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ff9800' }}>
            {loading ? '-' : stats.pendientes}
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          padding: 20,
          textAlign: 'center',
          borderLeft: '3px solid #4caf50'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Aprobadas
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4caf50' }}>
            {loading ? '-' : stats.aprobadas}
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          padding: 20,
          textAlign: 'center',
          borderLeft: '3px solid #f44336'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Rechazadas
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f44336' }}>
            {loading ? '-' : stats.rechazadas}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{ 
        background: '#fff', 
        border: '1px solid #e0e0e0',
        borderRadius: 4, 
        padding: '24px'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 20, color: '#333', fontSize: '1.1rem', fontWeight: 600 }}>
          Acciones
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16
        }}>
          {/* Nueva Solicitud */}
          <button
            onClick={() => navigate('/nueva-solicitud')}
            style={{
              background: '#1976d2',
              border: 'none',
              borderRadius: 4,
              padding: '16px 20px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.2s',
              fontSize: '0.95rem'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1565c0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1976d2';
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Nueva Solicitud
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              Crear una nueva solicitud de artículos
            </div>
          </button>

          {/* Mis Solicitudes */}
          <button
            onClick={() => navigate('/mis-solicitudes')}
            style={{
              background: '#fff',
              border: '1px solid #1976d2',
              borderRadius: 4,
              padding: '16px 20px',
              color: '#1976d2',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.2s',
              fontSize: '0.95rem'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Mis Solicitudes
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              Ver el estado de mis solicitudes
            </div>
          </button>
        </div>
      </div>

      {/* Info adicional */}
      <div style={{ 
        marginTop: 24,
        padding: '16px 20px',
        background: '#f9f9f9',
        border: '1px solid #e0e0e0',
        borderRadius: 4
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '0.95rem', fontWeight: 600 }}>
          Instrucciones
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>
          <li>Crea una nueva solicitud seleccionando los artículos necesarios</li>
          <li>El encargado de suministro revisará y aprobará/rechazará la solicitud</li>
          <li>Recibirás notificaciones sobre el estado de tus solicitudes</li>
          <li>Consulta el historial en "Mis Solicitudes"</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardSolicitante;
