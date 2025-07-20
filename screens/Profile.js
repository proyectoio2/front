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
import { apiFetch } from '../core/api';

const Profile = () => {
  const { accessToken } = useAuth();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [profile, setProfile] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('[Profile] Cargando perfil...');
      const { data, ok } = await apiFetch('/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('[Profile] Respuesta:', { ok, data });
      
      if (ok && data && data.data) {
        setProfile({
          email: data.data.email || '',
          full_name: data.data.full_name || '',
          phone_number: data.data.phone_number || '',
          address: data.data.address || '',
        });
        console.log('[Profile] Perfil actualizado:', {
          email: data.data.email,
          full_name: data.data.full_name,
          phone_number: data.data.phone_number,
          address: data.data.address,
        });
      } else {
        console.error('[Profile] Error en respuesta:', data);
      }
    } catch (error) {
      console.error('[Profile] Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    console.log('[Profile] Navegando a EditProfile');
    navigation.navigate('EditProfile');
  };

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color={isDark ? '#aed581' : '#4CAF50'} />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

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

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Nombre completo:</Text>
            <Text style={[styles.value, isDark && styles.valueDark]}>
              {profile.full_name || 'No especificado'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Correo electrónico:</Text>
            <Text style={[styles.value, isDark && styles.valueDark]}>
              {profile.email || 'No especificado'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Número de teléfono:</Text>
            <Text style={[styles.value, isDark && styles.valueDark]}>
              {profile.phone_number || 'No especificado'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Dirección:</Text>
            <Text style={[styles.value, isDark && styles.valueDark]}>
              {profile.address || 'No especificado'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEditProfile}
        >
          <Text style={styles.buttonText}>Editar perfil</Text>
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
    textAlign: 'center',
  },
  titleDark: {
    color: '#aed581',
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  infoContainer: {
    marginBottom: 32,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  labelDark: {
    color: '#aaa',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingTextDark: {
    color: '#ccc',
  },
});

export default Profile;