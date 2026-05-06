import React, { createContext, useState, useContext, useEffect } from 'react';
import API_URL from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar usuario desde sessionStorage al iniciar
  useEffect(() => {
    const tokenGuardado = sessionStorage.getItem('token');
    const usuarioGuardado = sessionStorage.getItem('usuario');

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensaje || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      // Guardar en sessionStorage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

      setToken(data.token);
      setUsuario(data.usuario);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  const cambiarPassword = async (passwordActual, passwordNueva) => {
    try {
      const response = await fetch(`${API_URL}/auth/cambiar-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ passwordActual, passwordNueva }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensaje || 'Error al cambiar contraseña');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const verificarToken = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        logout();
        return false;
      }

      const data = await response.json();
      setUsuario(data.usuario);
      sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const esAdmin = () => usuario?.rol === 'admin';
  const esEncargadoSuministro = () => usuario?.rol === 'encargado_suministro';
  const esSolicitante = () => usuario?.rol === 'solicitante';
  const esEncargadoOAdmin = () => esAdmin() || esEncargadoSuministro();

  const value = {
    usuario,
    token,
    cargando,
    estaAutenticado: !!token,
    login,
    logout,
    cambiarPassword,
    verificarToken,
    esAdmin,
    esEncargadoSuministro,
    esSolicitante,
    esEncargadoOAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
