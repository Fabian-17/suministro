import React from 'react';

export const Loading = ({ message = 'Cargando...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '16px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #1976d2',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ color: '#666', fontSize: '0.95rem' }}>{message}</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export const ErrorMessage = ({ message, onRetry }) => (
  <div style={{
    padding: '24px',
    background: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    <p style={{ color: '#c33', marginBottom: '12px' }}>❌ {message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          background: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Reintentar
      </button>
    )}
  </div>
);

export default Loading;
