import React from 'react';
import ReactDOM from 'react-dom/client';
import { InventarioProvider } from './context/InventarioContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <InventarioProvider>
      <AppRoutes />
    </InventarioProvider>
  </React.StrictMode>
);
