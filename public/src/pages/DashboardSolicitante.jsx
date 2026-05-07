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
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        padding: '24px 32px',
        marginBottom: 32,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <h1 style={{ margin: 0, color: '#1976d2', fontSize: '2rem' }}>
          👋 Bienvenido, {usuario?.nombre || 'Usuario'}
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '1.1rem' }}>
          Panel de Solicitante - Área: <strong>{usuario?.encargado?.areas?.[0]?.nombre || 'Sin asignar'}</strong>
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 32
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
          padding: 24,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 4 }}>
            {loading ? '...' : stats.total}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>Solicitudes Totales</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: 12,
          padding: 24,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>⏳</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 4 }}>
            {loading ? '...' : stats.pendientes}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>Pendientes</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: 12,
          padding: 24,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 4 }}>
            {loading ? '...' : stats.aprobadas}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>Aprobadas</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          borderRadius: 12,
          padding: 24,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(250, 112, 154, 0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>❌</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 4 }}>
            {loading ? '...' : stats.rechazadas}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>Rechazadas</div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        padding: '32px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 24, color: '#333' }}>🚀 Acciones Rápidas</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20
        }}>
          {/* Nueva Solicitud */}
          <button
            onClick={() => navigate('/nueva-solicitud')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: 12,
              padding: '32px 24px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>➕</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
              Nueva Solicitud
            </div>
            <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
              Solicita artículos para tu área
            </div>
          </button>

          {/* Mis Solicitudes */}
          <button
            onClick={() => navigate('/mis-solicitudes')}
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              borderRadius: 12,
              padding: '32px 24px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(79, 172, 254, 0.2)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 172, 254, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 172, 254, 0.2)';
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
              Mis Solicitudes
            </div>
            <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
              Revisa el estado de tus solicitudes
            </div>
          </button>
        </div>
      </div>

      {/* Info adicional */}
      <div style={{ 
        marginTop: 32,
        padding: '20px 24px',
        background: '#e3f2fd',
        borderRadius: 12,
        borderLeft: '4px solid #1976d2'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1976d2', fontSize: '1.1rem' }}>
          💡 ¿Cómo funciona?
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#555', lineHeight: 1.8 }}>
          <li>Crea una <strong>Nueva Solicitud</strong> seleccionando los artículos que necesitas</li>
          <li>El encargado de suministro revisará tu solicitud</li>
          <li>Recibirás una <strong>notificación en tiempo real</strong> cuando sea aprobada o rechazada</li>
          <li>Puedes ver el estado de todas tus solicitudes en <strong>Mis Solicitudes</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardSolicitante;
