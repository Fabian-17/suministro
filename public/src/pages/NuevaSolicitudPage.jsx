import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductoAutocomplete from '../components/ProductoAutocomplete';
import API_URL from '../config/api';
import '../styles/Solicitudes.css';

const NuevaSolicitudPage = () => {
  const [items, setItems] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const { token, usuario } = useAuth();
  const navigate = useNavigate();

  const agregarItem = (producto) => {
    // Verificar que no esté ya agregado
    if (items.find((item) => item.inventarioId === producto.id)) {
      alert('Este artículo ya está en la lista');
      return;
    }

    setItems([
      ...items,
      {
        inventarioId: producto.id,
        articulo: producto.articulo,
        codigo: producto.codigo,
        cantidad: 1,
        stockDisponible: producto.cantidad,
      },
    ]);
  };

  const actualizarCantidad = (index, cantidad) => {
    const nuevosItems = [...items];
    nuevosItems[index].cantidad = Math.max(1, parseInt(cantidad) || 1);
    setItems(nuevosItems);
  };

  const eliminarItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Debes agregar al menos un artículo');
      return;
    }

    // Validar stock
    const itemsSinStock = items.filter((item) => item.cantidad > item.stockDisponible);
    if (itemsSinStock.length > 0) {
      setError('Algunos artículos no tienen stock suficiente');
      return;
    }

    setError('');
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/solicitudes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            inventarioId: item.inventarioId,
            cantidad: item.cantidad,
          })),
          observaciones: observaciones || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al crear solicitud');
      }

      alert('✅ Solicitud creada correctamente');
      navigate('/mis-solicitudes');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="solicitud-container">
      <div className="solicitud-header">
        <h1>📦 Nueva Solicitud</h1>
        <p className="usuario-info">
          <strong>Área:</strong>{' '}
          {usuario?.encargado?.areas?.map((a) => a.nombre).join(', ') || 'Sin área asignada'}
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="solicitud-form">
        <div className="form-section">
          <h3>Agregar Artículos</h3>
          <ProductoAutocomplete 
            onProductoSeleccionado={agregarItem}
            validateExists={true}
            placeholder="🔍 Buscar artículos por nombre o código..."
            showStock={true}
          />
          {items.length === 0 && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#e3f2fd', 
              borderRadius: '6px',
              color: '#1976d2',
              fontSize: '0.9rem'
            }}>
              💡 <strong>Tip:</strong> Busca y selecciona artículos del inventario para agregarlos a tu solicitud
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="form-section">
            <h3>Artículos Solicitados ({items.length})</h3>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Artículo</th>
                  <th>Stock Disponible</th>
                  <th>Cantidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className={item.cantidad > item.stockDisponible ? 'sin-stock' : ''}>
                    <td>{item.codigo}</td>
                    <td>{item.articulo}</td>
                    <td>{item.stockDisponible}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarCantidad(index, e.target.value)}
                        className="input-cantidad"
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => eliminarItem(index)}
                        className="btn-eliminar"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="form-section">
          <h3>Observaciones (Opcional)</h3>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Agrega cualquier observación relevante..."
            rows={4}
            className="textarea-observaciones"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={cargando || items.length === 0} 
            className="btn-primary"
            title={items.length === 0 ? 'Debes agregar al menos un artículo' : ''}
          >
            {cargando ? '⏳ Creando...' : '✅ Crear Solicitud'}
          </button>
        </div>
        
        {items.length === 0 && (
          <div style={{ 
            marginTop: '1rem', 
            textAlign: 'center',
            color: '#999',
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}>
            El botón se habilitará cuando agregues al menos un artículo
          </div>
        )}
      </form>
    </div>
  );
};

export default NuevaSolicitudPage;
