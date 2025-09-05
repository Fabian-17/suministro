import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InventarioPage from '../pages/InventarioPage';
import EntradasPage from '../pages/EntradasPage';
import SalidasPage from '../pages/SalidasPage';
import EncargadosArea from '../pages/EncargadosArea';
import NuevaSalida from '../pages/NuevaSalida';

const AppRoutes = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<InventarioPage />} />
      <Route path="/entradas" element={<EntradasPage />} />
  <Route path="/salidas" element={<SalidasPage />} />
  <Route path="/nueva-salida" element={<NuevaSalida />} />
      <Route path="/encargados-area" element={<EncargadosArea />} />
    </Routes>
  </Router>
);

export default AppRoutes;
