import { useState, useEffect } from 'react';

/**
 * Hook personalizado para hacer fetch de datos con autenticación
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones del fetch
 * @returns {object} { data, loading, error, refetch }
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Incluir token JWT automáticamente
      const token = sessionStorage.getItem('token');
      const headers = {
        ...options.headers,
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
      
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
};
