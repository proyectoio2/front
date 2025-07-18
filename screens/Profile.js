import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../core/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Profile = () => {
  const { accessToken, logout } = useAuth();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [profile, setProfile] = useState({ email: '', username: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('[Profile] fetchProfile iniciado con accessToken:', accessToken);
      const url = 'https://florafind-aau6a.ondigitalocean.app/auth/me';
      console.log('[Profile] Fetch URL:', url);
      try {
        console.log('[Profile] Enviando GET /auth/me');
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });
        console.log('[Profile] Respuesta recibida status:', response.status);
        const text = await response.text();
        console.log('[Profile] Respuesta text:', text);
        let json = null;
        try {
          json = JSON.parse(text);
          console.log('[Profile] Parsed JSON:', json);
        } catch (parseErr) {
          console.warn('[Profile] Error parsing JSON:', parseErr);
        }

        if (response.ok && json && json.data) {
          console.log('[Profile] Datos obtenidos:', json.data);
          setProfile({
            email: json.data.email,
            username: json.data.username,
          });
        } else {
          console.warn(
            '[Profile] Falló carga de perfil, detalle:',
            json?.detail || 'Sin detalle'
          );
        }
      } catch (err) {
        console.error('[Profile] Error de red en fetchProfile:', err);
      } finally {
        console.log('[Profile] fetchProfile finalizado');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [accessToken]);

  const handleEditProfile = () => {
    console.log('[Profile] Navegando a EditProfile');
    navigation.navigate('EditProfile');
  };
  const handleChangePassword = () => {
    console.log('[Profile] Navegando a ChangePassW');
    navigation.navigate('ChangePassW');
  };
  const handleLogout = () => {
    console.log('[Profile] Cerrando sesión');
    logout();
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View>
        <Text style={[styles.title, isDark && styles.titleDark]}>Perfil</Text>
        <View style={styles.profileImageContainer}>
          <Ionicons
            name="person-circle"
            size={120}
            color={isDark ? '#aed581' : '#4CAF50'}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={isDark ? '#aed581' : '#4CAF50'} />
        ) : (
          <View style={styles.infoContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Correo electrónico</Text>
            <Text style={[styles.value, isDark && styles.valueDark]}>
              {profile.email}
            </Text>

            <Text style={[styles.label, isDark && styles.labelDark]}>Nombre de usuario</Text>
            <Text style={[styles.value, isDark && styles.valueDark]}>
              {profile.username}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEditProfile}
        >
          <Text style={styles.buttonText}>Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleChangePassword}
        >
          <Text style={styles.buttonText}>Cambiar contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    alignItems: "center",
  },
  titleDark: {
    color: '#aed581',
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  infoContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
  labelDark: {
    color: '#aaa',
  },
  value: {
    fontSize: 18,
    color: '#333',
    marginTop: 4,
  },
  valueDark: {
    color: '#fff',
  },
  buttonGroup: {},
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  logoutButton: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;