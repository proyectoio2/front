import { useState } from 'react';
import { apiFetch } from '../core/api';

export function useFetchPost() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = async (url, bodyData, isFormData = false) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const options = {
        method: 'POST',
        body: isFormData ? bodyData : JSON.stringify(bodyData),
      };
      if (!isFormData) {
        options.headers = { 'Content-Type': 'application/json' };
      }
      const { ok, data: respData } = await apiFetch(url.replace(/^https?:\/\/[^/]+/, ''), options);
      if (!ok) throw respData;
      setData(respData);
      return respData;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, post };
}
