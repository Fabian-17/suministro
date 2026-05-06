import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import '../styles/Usuarios.css';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rol: 'solicitante',
    encargadoId: '',
    activo: true,
  });
  const { token } = useAuth();

  useEffect(() => {
    cargarUsuarios();
    cargarEncargados();
  }, [token]);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsuarios(data.usuarios || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarEncargados = async () => {
    try {
      const response = await fetch(`${API_URL}/encargados`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEncargados(data || []);
    } catch (err) {
      console.error('Error al cargar encargados:', err);
    }
  };

  const abrirModalNuevo = () => {
    setUsuarioEditando(null);
    setFormData({
      username: '',
      password: '',
      rol: 'solicitante',
      encargadoId: '',
      activo: true,
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      username: usuario.username,
      password: '', // No mostrar password actual
      rol: usuario.rol,
      encargadoId: usuario.encargadoId || '',
      activo: usuario.activo,
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }

    if (!usuarioEditando && !formData.password) {
      setError('La contraseña es requerida para nuevos usuarios');
      return;
    }

    if (formData.rol === 'solicitante' && !formData.encargadoId) {
      setError('Los solicitantes deben tener un encargado asignado');
      return;
    }

    try {
      const body = {
        username: formData.username,
        rol: formData.rol,
        encargadoId: formData.encargadoId || null,
        activo: formData.activo,
      };

      // Solo incluir password si se proporcionó
      if (formData.password) {
        body.password = formData.password;
      }

      const url = usuarioEditando
        ? `${API_URL}/usuarios/${usuarioEditando.id}`
        : `${API_URL}/usuarios`;

      const response = await fetch(url, {
        method: usuarioEditando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al guardar usuario');
      }

      alert(`✅ Usuario ${usuarioEditando ? 'actualizado' : 'creado'} correctamente`);
      cerrarModal();
      cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const cambiarEstado = async (usuario) => {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Estás seguro de ${accion} al usuario ${usuario.username}?`)) return;

    try {
      const url = usuario.activo
        ? `${API_URL}/usuarios/${usuario.id}`
        : `${API_URL}/usuarios/${usuario.id}/activar`;

      const response = await fetch(url, {
        method: usuario.activo ? 'DELETE' : 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || `Error al ${accion} usuario`);
      }

      alert(`✅ Usuario ${accion} correctamente`);
      cargarUsuarios();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const getRolBadge = (rol) => {
    const badges = {
      admin: { clase: 'badge-admin', texto: '👑 Admin' },
      encargado_suministro: { clase: 'badge-encargado', texto: '📦 Encargado' },
      solicitante: { clase: 'badge-solicitante', texto: '👤 Solicitante' },
    };
    return badges[rol] || { clase: '', texto: rol };
  };

  if (cargando) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h1>👥 Gestión de Usuarios</h1>
        <button onClick={abrirModalNuevo} className="btn-primary">
          + Nuevo Usuario
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="usuarios-tabla">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Encargado Vinculado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => {
              const badge = getRolBadge(usuario.rol);
              return (
                <tr key={usuario.id} className={!usuario.activo ? 'usuario-inactivo' : ''}>
                  <td>{usuario.id}</td>
                  <td>{usuario.username}</td>
                  <td>
                    <span className={`badge ${badge.clase}`}>{badge.texto}</span>
                  </td>
                  <td>{usuario.encargado?.nombre || '-'}</td>
                  <td>
                    <span className={usuario.activo ? 'estado-activo' : 'estado-inactivo'}>
                      {usuario.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="acciones">
                      <button onClick={() => abrirModalEditar(usuario)} className="btn-editar">
                        ✏️
                      </button>
                      <button
                        onClick={() => cambiarEstado(usuario)}
                        className={usuario.activo ? 'btn-desactivar' : 'btn-activar'}
                        disabled={usuario.rol === 'admin' && usuario.activo}
                        title={
                          usuario.rol === 'admin' && usuario.activo
                            ? 'No puedes desactivar el único admin'
                            : usuario.activo
                            ? 'Desactivar'
                            : 'Activar'
                        }
                      >
                        {usuario.activo ? '🔒' : '🔓'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Crear/Editar */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{usuarioEditando ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={cerrarModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="usuario-form">
              <div className="form-group">
                <label>Usuario *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Contraseña {usuarioEditando ? '(dejar vacío para mantener)' : '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!usuarioEditando}
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  required
                >
                  <option value="solicitante">Solicitante</option>
                  <option value="encargado_suministro">Encargado de Suministro</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {formData.rol === 'solicitante' && (
                <div className="form-group">
                  <label>Encargado Vinculado *</label>
                  <select
                    value={formData.encargadoId}
                    onChange={(e) => setFormData({ ...formData, encargadoId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar encargado...</option>
                    {encargados.map((enc) => (
                      <option key={enc.id} value={enc.id}>
                        {enc.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {usuarioEditando && (
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    />
                    Usuario activo
                  </label>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button type="button" onClick={cerrarModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {usuarioEditando ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage;
