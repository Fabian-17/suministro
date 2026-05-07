import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSolicitante from './DashboardSolicitante';
import InventarioPage from './InventarioPage';

const HomePage = () => {
  const { esEncargadoOAdmin } = useAuth();

  // Encargados y admins ven el inventario completo
  if (esEncargadoOAdmin()) {
    return <InventarioPage />;
  }

  // Solicitantes ven su dashboard
  return <DashboardSolicitante />;
};

export default HomePage;
