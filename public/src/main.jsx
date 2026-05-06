import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { InventarioProvider } from './context/InventarioContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <InventarioProvider>
            <AppRoutes />
          </InventarioProvider>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
