// hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react';

export const useFetch = (url, token) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    setError(null);

    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        Accept: 'application/json',
      },
      signal,
    })
      .then(async (response) => {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        const responseData = isJson ? await response.json() : null;

        if (!response.ok) {
          throw responseData || { message: 'Error desconocido al obtener datos' };
        }

        setData(responseData);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('[useFetch] Error de carga:', err);
          setError(err);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url, token]);

  useEffect(() => {
    const abort = fetchData();
    return () => abort();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
