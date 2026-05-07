import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../config/api';

const ProductoAutocomplete = ({ 
  value, 
  onChange, 
  onProductoSeleccionado, // Nuevo: para compatibilidad con NuevaSolicitudPage
  required = false, 
  validateExists = false,
  placeholder = "Buscar producto...",
  showStock = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const wrapperRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar productos con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_URL}/inventarios/search?q=${encodeURIComponent(searchTerm.trim())}`, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data.slice(0, 10) : []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error buscando productos:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setShowSuggestions(false);
    
    // Llamar a onChange si existe (uso normal)
    if (onChange) {
      onChange(product);
    }
    
    // Llamar a onProductoSeleccionado si existe (para NuevaSolicitudPage)
    if (onProductoSeleccionado) {
      onProductoSeleccionado(product);
      // Limpiar el input después de seleccionar para agregar otro
      setSearchTerm('');
      setSelectedProduct(null);
    } else {
      // Solo actualizar el término de búsqueda si NO es modo onProductoSeleccionado
      setSearchTerm(product.articulo);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // Si se borra o cambia, limpiar selección
    if (selectedProduct && newValue !== selectedProduct.articulo) {
      setSelectedProduct(null);
      if (onChange) {
        onChange(null);
      }
    }
    
    // Si no se requiere validación, permitir texto libre
    if (!validateExists && onChange) {
      onChange({ articulo: newValue, id: null });
    }
  };

  const handleBlur = () => {
    // Si se requiere validación y no hay producto seleccionado, limpiar
    if (validateExists && !selectedProduct && searchTerm) {
      setTimeout(() => {
        setSearchTerm('');
        if (onChange) {
          onChange(null);
        }
      }, 200);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => searchTerm.trim().length >= 2 && setShowSuggestions(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        style={{
          width: '93%',
          padding: '8px 12px',
          border: selectedProduct && validateExists ? '2px solid #4caf50' : '1px solid #ccc',
          borderRadius: 6,
          fontSize: '0.95rem',
          backgroundColor: selectedProduct && validateExists ? '#f1f8f4' : 'white'
        }}
      />
      
      {loading && (
        <div style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 16,
          height: 16,
          border: '2px solid #1976d2',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: 6,
          marginTop: 4,
          maxHeight: 200,
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          {suggestions.map((product) => (
            <div
              key={product.id}
              onMouseDown={() => handleSelectProduct(product)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <div style={{ fontWeight: 500, color: '#333' }}>{product.articulo}</div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 2 }}>
                Código: {product.codigo}
                {showStock && ` | Stock: ${product.cantidad}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerm.trim().length >= 2 && !loading && suggestions.length === 0 && showSuggestions && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: 6,
          marginTop: 4,
          padding: '10px 12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          color: '#999',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          {validateExists ? 'No se encontraron productos' : 'No hay sugerencias, puedes escribir libremente'}
        </div>
      )}

      {validateExists && !selectedProduct && searchTerm && (
        <div style={{ fontSize: '0.8rem', color: '#ff5252', marginTop: 4 }}>
          Debes seleccionar un producto de la lista
        </div>
      )}
    </div>
  );
};

export default ProductoAutocomplete;
