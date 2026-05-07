import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notificaciones from './Notificaciones';
import '../styles/Navbar.css';

const Navbar = () => {
  const { usuario, logout, estaAutenticado, esAdmin, esEncargadoOAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  if (!estaAutenticado) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">📦 Sistema de Suministros</Link>
      </div>

      <div className="navbar-menu">
        {/* MENÚ PARA ADMIN Y ENCARGADOS */}
        {esEncargadoOAdmin() && (
          <>
            <Link to="/">Inventario</Link>
            <Link to="/entradas">Entradas</Link>
            <Link to="/salidas">Salidas</Link>
            <Link to="/solicitudes-pendientes">Pendientes</Link>
            <Link to="/solicitudes-aprobadas">Aprobadas</Link>
            {esAdmin() && <Link to="/usuarios">Usuarios</Link>}
          </>
        )}

        {/* MENÚ PARA SOLICITANTES */}
        {!esEncargadoOAdmin() && (
          <>
            <Link to="/">Inicio</Link>
            <Link to="/nueva-solicitud">Nueva Solicitud</Link>
            <Link to="/mis-solicitudes">Mis Solicitudes</Link>
          </>
        )}
      </div>

      <div className="navbar-actions">
        <Notificaciones />
        <div className="usuario-info">
          <span className="usuario-nombre">{usuario?.username}</span>
          <span className="usuario-rol">
            {usuario?.rol === 'admin'
              ? '👑 Admin'
              : usuario?.rol === 'encargado_suministro'
              ? '📦 Encargado'
              : '👤 Solicitante'}
          </span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Salir
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
