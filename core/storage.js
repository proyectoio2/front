// storage.js
// Helper multiplataforma para guardar y leer datos (tokens) de forma segura y compatible

import { Platform } from 'react-native';

let storage;

if (Platform.OS === 'web') {
  // Web: usar localStorage
  storage = {
    async getItem(key) {
      return localStorage.getItem(key);
    },
    async setItem(key, value) {
      localStorage.setItem(key, value);
    },
    async removeItem(key) {
      localStorage.removeItem(key);
    },
    async multiSet(pairs) {
      pairs.forEach(([k, v]) => localStorage.setItem(k, v));
    },
    async multiRemove(keys) {
      keys.forEach(k => localStorage.removeItem(k));
    },
  };
} else {
  // Nativo: usar SecureStore si está disponible, si no AsyncStorage
  let SecureStore;
  try {
    SecureStore = require('expo-secure-store');
  } catch {}
  if (SecureStore && SecureStore.isAvailableAsync) {
    storage = {
      async getItem(key) {
        return await SecureStore.getItemAsync(key);
      },
      async setItem(key, value) {
        await SecureStore.setItemAsync(key, value);
      },
      async removeItem(key) {
        await SecureStore.deleteItemAsync(key);
      },
      async multiSet(pairs) {
        await Promise.all(pairs.map(([k, v]) => SecureStore.setItemAsync(k, v)));
      },
      async multiRemove(keys) {
        await Promise.all(keys.map(k => SecureStore.deleteItemAsync(k)));
      },
    };
  } else {
    // Fallback: AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    storage = {
      async getItem(key) {
        return await AsyncStorage.getItem(key);
      },
      async setItem(key, value) {
        await AsyncStorage.setItem(key, value);
      },
      async removeItem(key) {
        await AsyncStorage.removeItem(key);
      },
      async multiSet(pairs) {
        await AsyncStorage.multiSet(pairs);
      },
      async multiRemove(keys) {
        await AsyncStorage.multiRemove(keys);
      },
    };
  }
}

export default storage;
