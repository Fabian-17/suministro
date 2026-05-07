/**
 * Fetch con autenticación JWT automática
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones del fetch (method, body, headers, etc.)
 * @returns {Promise<Response>}
 */
export const fetchWithAuth = async (url, options = {}) => {
  const token = sessionStorage.getItem('token');
  
  const headers = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  // Si el body no es FormData, agregar Content-Type
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...options,
    headers
  });
};

/**
 * Helper para fetch con JSON automático
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones del fetch
 * @returns {Promise<any>} - JSON parseado
 */
export const fetchJsonWithAuth = async (url, options = {}) => {
  const response = await fetchWithAuth(url, options);
  
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // Si no es JSON válido, continuar
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Error ${response.status}`);
  }

  return data;
};
