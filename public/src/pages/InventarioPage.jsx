import React, { useState, useEffect, useRef } from 'react';
import NuevoRegistroForm from '../components/NuevoRegistroForm';
import EditarRegistroForm from '../components/EditarRegistroForm';
import ProductoAutocomplete from '../components/ProductoAutocomplete';
import EncargadoAutocomplete from '../components/EncargadoAutocomplete';
import { useNavigate } from 'react-router-dom';
import { useInventario } from '../hooks/useInventario.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import { fetchWithAuth } from '../utils/fetchHelpers';


const InventarioPage = () => {
  const [search, setSearch] = useState('');
  const { inventario, loading, error, refresh, uploadExcel, loadMore, hasMore, page, totalPages, searchInventario, isSearching } = useInventario();
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileInputRef = useRef();
  const [editRegistro, setEditRegistro] = useState(null);
  const { showToast } = useToast();
  const { esEncargadoOAdmin } = useAuth();
  const tableContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  // Estado para alternar entre formulario de entrada y salida
  const [formularioActivo, setFormularioActivo] = useState('entrada'); // 'entrada' o 'salida'
  
  // Estados para formulario de salida
  const [areas, setAreas] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [filteredEncargados, setFilteredEncargados] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [salidaForm, setSalidaForm] = useState({
    productoId: '',
    cantidad: '',
    fecha: new Date().toISOString().slice(0, 10),
    encargadoId: '',
    encargadoNombre: '',
    areaId: ''
  });
  const [selectedProductoSalida, setSelectedProductoSalida] = useState(null);
  const [selectedEncargado, setSelectedEncargado] = useState(null);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadMsg(null);
    const file = fileInputRef.current.files[0];
    if (!file) return setUploadMsg('Selecciona un archivo primero.');
    setUploading(true);
    try {
      await uploadExcel(file);
      setUploadMsg('Archivo procesado correctamente.');
      showToast('Archivo procesado correctamente.', 'success');
    } catch (err) {
      setUploadMsg(err.message);
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Cargar áreas y encargados para formulario de salida
  useEffect(() => {
    fetchWithAuth(`${API_URL}/areas`)
      .then(r => r.json())
      .then(data => setAreas(Array.isArray(data) ? data : []));
    
    fetchWithAuth(`${API_URL}/encargados`)
      .then(r => r.json())
      .then(data => setEncargados(Array.isArray(data) ? data : []));
  }, []);

  // Filtrar encargados por área seleccionada
  useEffect(() => {
    if (salidaForm.areaId) {
      fetchWithAuth(`${API_URL}/encargados/area/${salidaForm.areaId}`)
        .then(r => r.json())
        .then(data => setFilteredEncargados(Array.isArray(data) ? data : []))
        .catch(() => setFilteredEncargados([]));
    } else {
      setFilteredEncargados([]);
    }
  }, [salidaForm.areaId]);

  // Filtrar áreas por encargado seleccionado
  useEffect(() => {
    if (salidaForm.encargadoId) {
      fetchWithAuth(`${API_URL}/encargados/encargado/${salidaForm.encargadoId}`)
        .then(r => r.json())
        .then(data => setFilteredAreas(Array.isArray(data) ? data : []))
        .catch(() => setFilteredAreas([]));
    } else {
      setFilteredAreas([]);
    }
  }, [salidaForm.encargadoId]);

  // Obtener opciones de áreas (filtradas o todas)
  const getAreaOptions = () => {
    if (salidaForm.encargadoId && filteredAreas.length > 0) {
      return filteredAreas;
    }
    return areas;
  };

  // Obtener opciones de encargados (filtrados o todos)
  const getEncargadoOptions = () => {
    if (salidaForm.areaId && filteredEncargados.length > 0) {
      return filteredEncargados;
    }
    return encargados;
  };

  // Manejar submit de salida
  const handleSalidaSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado un producto
    if (!selectedProductoSalida) {
      showToast('Debes seleccionar un producto válido', 'error');
      return;
    }

    // Validar que se haya ingresado un encargado
    if (!selectedEncargado || !selectedEncargado.nombre || selectedEncargado.nombre.trim().length === 0) {
      showToast('Debes ingresar un encargado/destinatario', 'error');
      return;
    }
    
    try {
      const area = areas.find(a => a.id === Number(salidaForm.areaId));
      let encargadoNombre = selectedEncargado.nombre;
      let encargadoId = selectedEncargado.id;

      // Si es un encargado nuevo (no tiene ID), crearlo en el backend
      if (selectedEncargado.isNew && !selectedEncargado.id) {
        try {
          const createEncargadoRes = await fetchWithAuth(`${API_URL}/encargados`, {
            method: 'POST',
            body: JSON.stringify({ 
              nombre: selectedEncargado.nombre.trim(),
              areaIds: salidaForm.areaId ? [Number(salidaForm.areaId)] : []
            })
          });
          
          if (createEncargadoRes.ok) {
            const newEncargado = await createEncargadoRes.json();
            encargadoId = newEncargado.id;
            // Actualizar lista de encargados
            setEncargados(prev => [...prev, newEncargado]);
            showToast(`Encargado "${selectedEncargado.nombre}" creado y asignado al área`, 'success');
          }
        } catch (err) {
          console.log('Error creando encargado, pero continuamos con el nombre:', err);
        }
      }
      
      const res = await fetchWithAuth(`${API_URL}/salidas`, {
        method: 'POST',
        body: JSON.stringify({
          articulo: selectedProductoSalida.articulo,
          codigo: selectedProductoSalida.codigo,
          cantidad: Number(salidaForm.cantidad),
          area: area ? area.nombre : '',
          destinatario: encargadoNombre,
          fecha: salidaForm.fecha
        })
      });
      if (!res.ok) throw new Error('Error al registrar salida');
      showToast('Salida registrada correctamente', 'success');
      setSalidaForm({
        productoId: '',
        cantidad: '',
        fecha: new Date().toISOString().slice(0, 10),
        encargadoId: '',
        encargadoNombre: '',
        areaId: ''
      });
      setSelectedProductoSalida(null);
      setSelectedEncargado(null);
      refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Búsqueda con debounce
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Si no hay búsqueda, recargar datos normales
    if (!search || search.trim().length === 0) {
      if (isSearching) {
        // Solo llamar refresh si estábamos en modo búsqueda
        refresh();
      }
      return;
    }

    // Esperar 500ms después de que el usuario deje de escribir
    searchTimeoutRef.current = setTimeout(() => {
      searchInventario(search);
    }, 500);

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, isSearching, refresh, searchInventario]);

  // Actualizar filtered cuando cambia inventario
  useEffect(() => {
    setFiltered(inventario);
  }, [inventario]);

  // Detectar scroll para cargar más registros (solo si NO hay búsqueda activa)
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container || isSearching) return; // No hacer scroll infinito si estamos en modo búsqueda

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Si el usuario está cerca del final (50px antes), cargar más
      if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !loading) {
        loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadMore, isSearching]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f5',
      padding: '20px'
    }}>
      {/* Header con título y botones de navegación */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        padding: '20px 32px',
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          
          {/* Botones solo para encargados y admin */}
          {esEncargadoOAdmin() && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button 
                className="btn btn-info" 
                onClick={() => navigate('/entradas')}
                style={{ fontSize: '0.9rem' }}
              >
                Ver Historial Entradas
              </button>
              <button 
                className="btn btn-warning" 
                onClick={() => navigate('/salidas')}
                style={{ fontSize: '0.9rem' }}
              >
                Ver Historial Salidas
              </button>
              <button 
                className="btn btn-success" 
                onClick={() => navigate('/encargados-area')}
                style={{ fontSize: '0.9rem' }}
              >
                Encargados
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/nota-pedido-semanal')}
                style={{ fontSize: '0.9rem' }}
              >
                Nota Pedido
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Layout: Solo mostrar formularios a encargados/admin */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: esEncargadoOAdmin() ? '420px 1fr' : '1fr',
        gap: 20,
        alignItems: 'start'
      }}>
        {/* COLUMNA IZQUIERDA - Formulario fijo (solo encargados/admin) */}
        {esEncargadoOAdmin() && (
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 20
          }}>
            {/* Tabs para alternar entre Entrada y Salida */}
            <div style={{ 
              display: 'flex', 
              gap: 8, 
              marginBottom: 20,
              borderBottom: '2px solid #e0e0e0'
            }}>
              <button
                onClick={() => setFormularioActivo('entrada')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: formularioActivo === 'entrada' ? '#1976d2' : 'transparent',
                  color: formularioActivo === 'entrada' ? '#fff' : '#666',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.2s'
                }}
              >
                Entrada
              </button>
              <button
                onClick={() => setFormularioActivo('salida')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: formularioActivo === 'salida' ? '#ff9800' : 'transparent',
                  color: formularioActivo === 'salida' ? '#fff' : '#666',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.2s'
                }}
              >
                Salida
              </button>
            </div>

            {/* Formulario de Entrada */}
            {formularioActivo === 'entrada' && (
              <>
                <h3 style={{ 
                  marginTop: 0, 
                  marginBottom: 20, 
                  color: '#1976d2',
                  fontSize: '1.2rem'
                }}>
                  ➕ Nueva Entrada
                </h3>
                <NuevoRegistroForm onSuccess={() => {
                  refresh();
                  showToast('Entrada registrada correctamente', 'success');
                  showToast('Entrada registrada correctamente', 'success');
              }} />

              {/* Formulario para subir Excel */}
              <div style={{ 
                marginTop: 32, 
                paddingTop: 24, 
                borderTop: '1px solid #e0e0e0' 
              }}>
                <h4 style={{ 
                  marginTop: 0, 
                  marginBottom: 16, 
                  fontSize: '1rem',
                  color: '#555'
                }}>
                  📄 Importar desde Excel
                </h4>
                <form onSubmit={handleFileUpload}>
                  <input 
                    type="file" 
                    accept=".xls,.xlsx,.xlsm" 
                    ref={fileInputRef} 
                    disabled={uploading}
                    style={{ 
                      width: '100%',
                      marginBottom: 12,
                      padding: 8,
                      border: '1px solid #ccc',
                      borderRadius: 6,
                      fontSize: '0.9rem'
                    }}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={uploading}
                    style={{ width: '100%' }}
                  >
                    {uploading ? '⏳ Subiendo...' : '📤 Subir Excel'}
                  </button>
                  {uploadMsg && (
                    <div style={{ 
                      marginTop: 12, 
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      background: uploadMsg.includes('correctamente') ? '#e8f5e9' : '#ffebee',
                      color: uploadMsg.includes('correctamente') ? '#2e7d32' : '#c62828'
                    }}>
                      {uploadMsg}
                    </div>
                  )}
                </form>
              </div>
            </>
          )}

          {/* Formulario de Salida */}
          {formularioActivo === 'salida' && (
            <>
              <h3 style={{ 
                marginTop: 0, 
                marginBottom: 20, 
                color: '#ff9800',
                fontSize: '1.2rem'
              }}>
                ➕ Nueva Salida
              </h3>
              <form onSubmit={handleSalidaSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Producto *</label>
                  <ProductoAutocomplete
                    value={selectedProductoSalida ? selectedProductoSalida.articulo : ''}
                    onChange={(product) => {
                      setSelectedProductoSalida(product);
                      setSalidaForm({...salidaForm, productoId: product?.id || ''});
                    }}
                    required
                    validateExists={true}
                    placeholder="Buscar producto en inventario..."
                    showStock={true}
                  />
                  {selectedProductoSalida && (
                    <div style={{ 
                      marginTop: 8, 
                      padding: '8px 12px', 
                      background: '#e8f5e9', 
                      borderRadius: 4,
                      fontSize: '0.85rem',
                      color: '#2e7d32'
                    }}>
                      ✓ Stock disponible: {selectedProductoSalida.cantidad} unidades
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Cantidad *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedProductoSalida ? selectedProductoSalida.cantidad : undefined}
                    value={salidaForm.cantidad}
                    onChange={e => setSalidaForm({...salidaForm, cantidad: e.target.value})}
                    style={{ width: '93%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.95rem' }}
                    disabled={!selectedProductoSalida}
                  />
                  {selectedProductoSalida && salidaForm.cantidad && Number(salidaForm.cantidad) > selectedProductoSalida.cantidad && (
                    <div style={{ fontSize: '0.8rem', color: '#ff5252', marginTop: 4 }}>
                      La cantidad supera el stock disponible ({selectedProductoSalida.cantidad})
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Fecha *</label>
                  <input
                    type="date"
                    required
                    value={salidaForm.fecha}
                    onChange={e => setSalidaForm({...salidaForm, fecha: e.target.value})}
                    style={{ width: '93%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Área *</label>
                  <select
                    required
                    value={salidaForm.areaId}
                    onChange={e => {
                      setSalidaForm({...salidaForm, areaId: e.target.value, encargadoId: '', encargadoNombre: ''});
                      setSelectedEncargado(null); // Limpiar encargado al cambiar área
                    }}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.95rem' }}
                  >
                    <option value="">Seleccionar área</option>
                    {getAreaOptions().map(area => (
                      <option key={area.id} value={area.id}>{area.nombre}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Destinatario (Encargado) *</label>
                  <EncargadoAutocomplete
                    value={selectedEncargado ? selectedEncargado.nombre : ''}
                    onChange={(encargado) => {
                      setSelectedEncargado(encargado);
                      setSalidaForm({
                        ...salidaForm, 
                        encargadoId: encargado?.id || '',
                        encargadoNombre: encargado?.nombre || ''
                      });
                    }}
                    required
                    areaId={salidaForm.areaId}
                    placeholder="Buscar o escribir nombre del encargado..."
                  />
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 4, fontStyle: 'italic' }}>
                    💡 Puedes escribir un nombre nuevo y se creará automáticamente
                  </div>
                </div>

                <button type="submit" className="btn btn-warning" style={{ width: '100%', padding: '10px', fontSize: '1rem', fontWeight: 600 }}>
                  📤 Registrar Salida
                </button>
              </form>
            </>
          )}
        </div>
        )}

        {/* COLUMNA DERECHA - Inventario */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          {/* Buscador */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="🔍 Buscar por artículo o código (busca en toda la base de datos)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                padding: '12px 16px', 
                width: '95%',
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#1976d2'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
            {search && search.trim().length > 0 && (
              <div style={{ 
                marginTop: 8, 
                fontSize: '0.9rem', 
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                {loading ? (
                  <>
                    <div style={{ 
                      width: 14, 
                      height: 14, 
                      border: '2px solid #1976d2', 
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    {filtered.length} resultado(s) encontrado(s)
                    <button
                      onClick={() => {
                        setSearch('');
                        refresh(); // Recargar datos normales
                      }}
                      style={{
                        marginLeft: 'auto',
                        padding: '4px 12px',
                        background: '#ff5252',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      ✖ Limpiar búsqueda
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Tabla de inventario */}
          <div 
            ref={tableContainerRef}
            style={{ 
              maxHeight: 'calc(100vh - 240px)', 
              overflowY: 'auto', 
              border: '1px solid #e0e0e0', 
              borderRadius: 8 
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '30%', zIndex: 2, fontWeight: 600 }}>Artículo</th>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '15%', zIndex: 2, fontWeight: 600 }}>Código</th>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '12%', zIndex: 2, fontWeight: 600, textAlign: 'center' }}>Entrada</th>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '12%', zIndex: 2, fontWeight: 600, textAlign: 'center' }}>Salida</th>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '15%', zIndex: 2, fontWeight: 600, textAlign: 'center' }}>Stock Actual</th>
                  {esEncargadoOAdmin() && (
                    <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '8%', zIndex: 2, fontWeight: 600, textAlign: 'center' }}>Editar</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading && page === 1 ? (
                  <tr><td colSpan={esEncargadoOAdmin() ? 6 : 5} style={{ textAlign: 'center', padding: 32, color: '#999' }}>⏳ Cargando inventario...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={esEncargadoOAdmin() ? 6 : 5} style={{ textAlign: 'center', padding: 32, color: '#999' }}>
                    {search ? '❌ No hay resultados para tu búsqueda' : '📦 No hay artículos en el inventario'}
                  </td></tr>
                ) : (
                  <>
                    {filtered.map(i => {
                    const entrada = i.entrada || 0;
                    const salida = i.salida || 0;
                    const cantidadActual = i.cantidad || 0;
                    let color = '';
                    let bgColor = '';
                    if (cantidadActual > 50) {
                      color = '#2e7d32';
                      bgColor = '#e8f5e9';
                    } else if (cantidadActual < 10) {
                      color = '#c62828';
                      bgColor = '#ffebee';
                    } else {
                      color = '#f57c00';
                      bgColor = '#fff3e0';
                    }
                    return (
                      <tr key={i.id} style={{ 
                        borderBottom: '1px solid #e0e0e0',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ border: '1px solid #e2e2e2', padding: '10px 8px' }}>{i.articulo}</td>
                        <td style={{ border: '1px solid #e2e2e2', padding: '10px 8px', fontSize: '0.9rem', color: '#666' }}>{i.codigo}</td>
                        <td style={{ border: '1px solid #e2e2e2', padding: '10px 8px', textAlign: 'center', color: '#1976d2', fontWeight: 500 }}>{entrada}</td>
                        <td style={{ border: '1px solid #e2e2e2', padding: '10px 8px', textAlign: 'center', color: '#666', fontWeight: 500 }}>{salida}</td>
                        <td style={{ 
                          border: '1px solid #e2e2e2', 
                          padding: '10px 8px', 
                          textAlign: 'center',
                          color: color, 
                          fontWeight: 'bold',
                          background: bgColor,
                          fontSize: '1.05rem'
                        }}>
                          {cantidadActual}
                        </td>
                        
                        {/* Columna de acciones - solo para encargados/admin */}
                        {esEncargadoOAdmin() && (
                          <td style={{ border: '1px solid #e2e2e2', padding: '10px 8px', textAlign: 'center' }}>
                            <button
                              title="Editar registro"
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                padding: 4,
                                borderRadius: 4,
                                transition: 'background 0.2s'
                              }}
                              onClick={() => setEditRegistro(i)}
                              onMouseEnter={e => e.currentTarget.style.background = '#e3f2fd'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <span role="img" aria-label="editar" style={{ fontSize: 20 }}>✏️</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    );})}
                    {loading && page > 1 && (
                      <tr>
                        <td colSpan={esEncargadoOAdmin() ? 6 : 5} style={{ textAlign: 'center', padding: '16px', background: '#f9f9f9', color: '#666', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <div style={{ 
                              width: 16, 
                              height: 16, 
                              border: '2px solid #1976d2', 
                              borderTopColor: 'transparent',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite'
                            }}></div>
                            Cargando más registros...
                          </div>
                        </td>
                      </tr>
                    )}
                    {!loading && !hasMore && !isSearching && inventario.length > 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '16px', background: '#f0f4f8', color: '#666', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          ✔️ Todos los registros cargados ({inventario.length} en total)
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Información de paginación */}
          {!isSearching && inventario.length > 0 && (
            <div style={{ 
              marginTop: 12, 
              textAlign: 'center', 
              fontSize: '0.85rem', 
              color: '#666' 
            }}>
              Página {page} de {totalPages} | Mostrando {inventario.length} registros
              {hasMore && (
                <span style={{ marginLeft: 8, color: '#1976d2' }}>
                  (Desplázate hacia abajo para cargar más)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para editar registro */}
      {editRegistro && (
        <div className="modal-overlay" onClick={() => setEditRegistro(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditRegistro(null)}>✕</button>
            <EditarRegistroForm
              registro={editRegistro}
              onSuccess={() => {
                refresh();
                setEditRegistro(null);
                showToast('Registro actualizado correctamente', 'success');
              }}
              onCancel={() => setEditRegistro(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioPage;
