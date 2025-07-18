// api.js
// Centraliza la URL base y helpers para llamadas a la API usando fetch puro y refresh automático

import storage from './storage';
import { tokenEvents } from './AuthContext';

export const API_BASE_URL = 'https://io2-l2tx8.ondigitalocean.app';

export const getStoredToken = async () => {
  try {
    return await storage.getItem('flora_token');
  } catch {
    return null;
  }
};

const TOKEN_KEY = 'flora_token';
const EXPIRY_KEY = 'flora_token_expiry';
const REFRESH_KEY = 'flora_refresh_token';
const REFRESH_EXPIRY_KEY = 'flora_refresh_token_expiry';

// Refresca el token usando el refresh_token almacenado
async function refreshTokenRequest() {
  const refreshToken = await storage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error('No refresh token');
  
  // Crear el body como form-urlencoded
  const formData = new URLSearchParams();
  formData.append('refresh_token', refreshToken);
  
  const resp = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString()
  });
  
  if (!resp.ok) throw new Error('Refresh token inválido');
  const data = await resp.json();
  const expiresIn = data.data.expires_in || 1800;
  const refreshExpiresIn = data.data.refresh_expires_in || 604800;
  const expiryTime = Date.now() + expiresIn * 1000;
  const refreshExpTime = Date.now() + refreshExpiresIn * 1000;
  await storage.multiSet([
    [TOKEN_KEY, data.data.access_token],
    [EXPIRY_KEY, expiryTime.toString()],
    [REFRESH_KEY, data.data.refresh_token || refreshToken],
    [REFRESH_EXPIRY_KEY, refreshExpTime.toString()],
  ]);
  tokenEvents.emit('tokenRefreshed'); // Notificar al contexto
  return data.data.access_token;
}

// apiFetch con fetch puro y refresh automático
export const apiFetch = async (endpoint, options = {}) => {
  let token = await storage.getItem(TOKEN_KEY);
  let headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let fetchOptions = {
    ...options,
    headers,
  };
  let url = endpoint.startsWith('http') ? endpoint : API_BASE_URL + endpoint;
  let resp = await fetch(url, fetchOptions);
  
  if (endpoint.includes('/auth/token')) {
    let data;
    try { 
      data = await resp.json();
    } catch { 
      data = null; 
    }
    return { ok: resp.ok, status: resp.status, data };
  }

  if (resp.status !== 401) {
    let data;
    try { data = await resp.json(); } catch { data = null; }
    return { ok: resp.ok, status: resp.status, data };
  }
  // Si 401, intentar refresh
  try {
    token = await refreshTokenRequest();
    headers['Authorization'] = `Bearer ${token}`;
    fetchOptions.headers = headers;
    resp = await fetch(url, fetchOptions);
    let data;
    try { data = await resp.json(); } catch { data = null; }
    return { ok: resp.ok, status: resp.status, data };
  } catch (err) {
    // Si falla el refresh, limpiar tokens
    await storage.multiRemove([TOKEN_KEY, EXPIRY_KEY, REFRESH_KEY, REFRESH_EXPIRY_KEY]);
    return { ok: false, status: 401, data: { error: 'Sesión expirada' } };
  }
};

// Ejemplo de uso:
// import { apiFetch } from '../api';
// const { ok, data } = await apiFetch('/gardens', { headers: { Authorization: ... } });
