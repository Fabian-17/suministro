import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import Loading from '../components/Loading';

// Páginas existentes
import HomePage from '../pages/HomePage';
import InventarioPage from '../pages/InventarioPage';
import EntradasPage from '../pages/EntradasPage';
import SalidasPage from '../pages/SalidasPage';
import EncargadosArea from '../pages/EncargadosArea';
import NuevaSalida from '../pages/NuevaSalida';
import NotaPedidoSemanal from '../pages/NotaPedidoSemanal';

// Nuevas páginas
import LoginPage from '../pages/LoginPage';
import NuevaSolicitudPage from '../pages/NuevaSolicitudPage';
import MisSolicitudesPage from '../pages/MisSolicitudesPage';
import SolicitudesPendientesPage from '../pages/SolicitudesPendientesPage';
import SolicitudesAprobadasPage from '../pages/SolicitudesAprobadasPage';
import UsuariosPage from '../pages/UsuariosPage';

const AppRoutes = () => {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return <Loading />;
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Ruta de login */}
        <Route
          path="/login"
          element={estaAutenticado ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Página principal - Dashboard diferente según rol */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Entradas, Salidas - Solo encargados y admins */}
        <Route
          path="/entradas"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'encargado_suministro']}>
              <EntradasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salidas"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'encargado_suministro']}>
              <SalidasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nueva-salida"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'encargado_suministro']}>
              <NuevaSalida />
            </ProtectedRoute>
          }
        />
        <Route
          path="/encargados-area"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'encargado_suministro']}>
              <EncargadosArea />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nota-pedido-semanal"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'encargado_suministro']}>
              <NotaPedidoSemanal />
            </ProtectedRoute>
          }
        />

        {/* Rutas de solicitudes (todos los autenticados) */}
        <Route
          path="/nueva-solicitud"
          element={
            <ProtectedRoute>
              <NuevaSolicitudPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-solicitudes"
          element={
            <ProtectedRoute>
              <MisSolicitudesPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas solo para encargados y admins */}
        <Route
          path="/solicitudes-pendientes"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'encargado_suministro']}>
              <SolicitudesPendientesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/solicitudes-aprobadas"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'encargado_suministro']}>
              <SolicitudesAprobadasPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta solo para admins */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
