// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3434';

export const API_ENDPOINTS = {
  // Endpoints existentes
  inventario: `${API_URL}/inventarios`,
  entradas: `${API_URL}/entradas`,
  salidas: `${API_URL}/salidas`,
  encargados: `${API_URL}/encargados`,
  areas: `${API_URL}/areas`,
  notaPedido: `${API_URL}/nota-pedido`,
  
  // Nuevos endpoints
  auth: {
    login: `${API_URL}/auth/login`,
    me: `${API_URL}/auth/me`,
    cambiarPassword: `${API_URL}/auth/cambiar-password`,
    logout: `${API_URL}/auth/logout`,
  },
  usuarios: `${API_URL}/usuarios`,
  solicitudes: {
    base: `${API_URL}/solicitudes`,
    mis: `${API_URL}/solicitudes/mis-solicitudes`,
    pendientes: `${API_URL}/solicitudes/pendientes`,
    aprobadas: `${API_URL}/solicitudes/aprobadas`,
  },
  notificaciones: {
    base: `${API_URL}/notificaciones`,
    noLeidas: `${API_URL}/notificaciones/no-leidas`,
    contador: `${API_URL}/notificaciones/contador`,
  },
};

export default API_URL;
