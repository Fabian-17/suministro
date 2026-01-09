// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3434';

export const API_ENDPOINTS = {
  inventario: `${API_URL}/inventarios`,
  entradas: `${API_URL}/entradas`,
  salidas: `${API_URL}/salidas`,
  encargados: `${API_URL}/encargados`,
  areas: `${API_URL}/areas`,
  notaPedido: `${API_URL}/nota-pedido`,
};

export default API_URL;
