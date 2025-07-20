import React, { createContext, useState, useEffect, useContext } from 'react';
import storage from './storage';
import { API_BASE_URL } from './api';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

// Reemplazo de EventEmitter compatible con React Native
function createEventEmitter() {
  const listeners = {};
  return {
    on(event, cb) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    },
    off(event, cb) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(fn => fn !== cb);
    },
    emit(event, ...args) {
      (listeners[event] || []).forEach(fn => fn(...args));
    },
  };
}

export const tokenEvents = createEventEmitter(); // Exportar para usar en api.js/apiClient.js

let refreshTimeout = null;

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [refreshExpiry, setRefreshExpiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Nuevo estado para el perfil
  const TOKEN_KEY = 'flora_token';
  const EXPIRY_KEY = 'flora_token_expiry';
  const REFRESH_KEY = 'flora_refresh_token';
  const REFRESH_EXPIRY_KEY = 'flora_refresh_token_expiry';
  const USER_KEY = 'flora_user';

  // Restaurar tokens al iniciar (sin expiración local)
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const token = await storage.getItem(TOKEN_KEY);
        const expiry = await storage.getItem(EXPIRY_KEY);
        const refresh = await storage.getItem(REFRESH_KEY);
        const refreshExp = await storage.getItem(REFRESH_EXPIRY_KEY);
        const userStr = await storage.getItem(USER_KEY);
        setAccessToken(token || null);
        setTokenExpiry(expiry ? parseInt(expiry, 10) : null);
        setRefreshToken(refresh || null);
        setRefreshExpiry(refreshExp ? parseInt(refreshExp, 10) : null);
        setUser(userStr ? JSON.parse(userStr) : null);
      } catch {}
      setLoading(false);
    };
    restoreToken();
  }, []);

  // Escuchar evento de refresh de token
  useEffect(() => {
    const onTokenRefreshed = async () => {
      const token = await storage.getItem(TOKEN_KEY);
      const expiry = await storage.getItem(EXPIRY_KEY);
      const refresh = await storage.getItem(REFRESH_KEY);
      const refreshExp = await storage.getItem(REFRESH_EXPIRY_KEY);
      const userStr = await storage.getItem(USER_KEY);
      setAccessToken(token || null);
      setTokenExpiry(expiry ? parseInt(expiry, 10) : null);
      setRefreshToken(refresh || null);
      setRefreshExpiry(refreshExp ? parseInt(refreshExp, 10) : null);
      setUser(userStr ? JSON.parse(userStr) : null);
    };
    tokenEvents.on('tokenRefreshed', onTokenRefreshed);
    return () => tokenEvents.off('tokenRefreshed', onTokenRefreshed);
  }, []);

  // Login: guarda ambos tokens y expiraciones
  const login = async (token, expiresInSeconds, refresh, refreshExpiresInSeconds, userProfile) => {
    if (!token || !refresh) {
      throw new Error('Credenciales inválidas');
    }
    setAccessToken(token);
    setRefreshToken(refresh);
    setUser(userProfile || null);
    const expiryTime = Date.now() + expiresInSeconds * 1000;
    const refreshExpTime = Date.now() + refreshExpiresInSeconds * 1000;
    setTokenExpiry(expiryTime);
    setRefreshExpiry(refreshExpTime);
    try {
      await storage.multiSet([
        [TOKEN_KEY, token],
        [EXPIRY_KEY, expiryTime.toString()],
        [REFRESH_KEY, refresh],
        [REFRESH_EXPIRY_KEY, refreshExpTime.toString()],
        [USER_KEY, userProfile ? JSON.stringify(userProfile) : ''],
      ]);
    } catch (error) {
      console.error('Error al guardar tokens:', error);
      throw new Error('Error al guardar la sesión');
    }
  };

  // Logout: limpia todo
  const logout = async () => {
    setAccessToken(null);
    setTokenExpiry(null);
    setRefreshToken(null);
    setRefreshExpiry(null);
    setUser(null);
    try {
      await storage.multiRemove([
        TOKEN_KEY,
        EXPIRY_KEY,
        REFRESH_KEY,
        REFRESH_EXPIRY_KEY,
        USER_KEY,
      ]);
    } catch {}
  };

  // Función para refrescar el token proactivamente
  const proactiveRefresh = async () => {
    try {
      const refresh = await storage.getItem(REFRESH_KEY);
      if (!refresh) throw new Error('No refresh token');
      
      const formData = new URLSearchParams();
      formData.append('refresh_token', refresh);
      
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
        [REFRESH_KEY, data.data.refresh_token || refresh],
        [REFRESH_EXPIRY_KEY, refreshExpTime.toString()],
      ]);
      setAccessToken(data.data.access_token);
      setTokenExpiry(expiryTime);
      setRefreshToken(data.data.refresh_token || refresh);
      setRefreshExpiry(refreshExpTime);
      tokenEvents.emit('tokenRefreshed');
      scheduleProactiveRefresh(expiryTime);
    } catch (e) {
      await logout();
    }
  };

  // Programa el refresh automático
  const scheduleProactiveRefresh = (expiry) => {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    if (!expiry) return;
    const ms = Math.max(expiry - Date.now() - 60000, 5000); // 1 min antes, mínimo 5s
    refreshTimeout = setTimeout(proactiveRefresh, ms);
  };

  // Reprogramar refresh cuando cambie el tokenExpiry
  useEffect(() => {
    scheduleProactiveRefresh(tokenExpiry);
    return () => { if (refreshTimeout) clearTimeout(refreshTimeout); };
  }, [tokenExpiry]);

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, loading, user }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
