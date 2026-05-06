import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, rolesPermitidos = [] }) => {
  const { estaAutenticado, usuario, cargando } = useAuth();

  if (cargando) {
    return <Loading />;
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles, verificar que el usuario tenga uno de ellos
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario?.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
