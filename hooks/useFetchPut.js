import { useState } from 'react';

export const useFetchPut = (token) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const put = async (url, body, isFormData = false) => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };
      if (!isFormData) headers['Content-Type'] = 'application/json';

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: isFormData ? body : JSON.stringify(body),
      });

      if (!response.ok) {
        // Intentamos leer error, pero no lanzamos excepción para no romper flujo
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || JSON.stringify(errorData);
        } catch {}
        setError(errorMessage);
        setLoading(false);
        // Solo retornamos el status para que el componente decida qué hacer
        return { status: response.status, data: null };
      }

      const data = await response.json();
      setLoading(false);
      return { status: response.status, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      // No lanzamos error para que no rompa flujo
      return { status: 0, data: null };
    }
  };

  return { loading, error, put };
};
