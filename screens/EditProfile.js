import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  useColorScheme,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../core/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../core/api';

const TITLE_COLOR = '#4CAF50';
const DISABLED_COLOR = '#81C784';

const EditProfile = () => {
  const { accessToken } = useAuth();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Estados para los campos del perfil
  const [profile, setProfile] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    address: '',
  });

  // Estados para edición individual
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Estados para el modal de contraseña
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Cargar datos del perfil
  useEffect(() => {
    fetchProfile();
  }, []);

  // Validar contraseñas
  useEffect(() => {
    const errs = {};
    if (!currentPassword.trim()) errs.currentPassword = 'La contraseña actual es obligatoria';
    if (!newPassword.trim()) errs.newPassword = 'La nueva contraseña es obligatoria';
    else if (newPassword.length < 8) errs.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    else if (!/(?=.*[0-9])/.test(newPassword)) errs.newPassword = 'La contraseña debe contener al menos un número';
    else if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(newPassword)) errs.newPassword = 'Debe contener al menos un caracter especial';
    else if (newPassword.length > 100) errs.newPassword = 'Máximo 100 caracteres';
    
    if (confirmPassword !== newPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
    
    setPasswordErrors(errs);
    setPasswordValid(Object.keys(errs).length === 0);
  }, [currentPassword, newPassword, confirmPassword]);

  const fetchProfile = async () => {
    try {
      const { data, ok } = await apiFetch('/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (ok && data && data.data) {
        setProfile({
          email: data.data.email || '',
          full_name: data.data.full_name || '',
          phone_number: data.data.phone_number || '',
          address: data.data.address || '',
        });
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const startEditing = (field, value) => {
    setEditingField(field);
    setEditValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveField = async () => {
    if (!editValue.trim()) {
      Alert.alert('Error', 'El campo no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      const body = { [editingField]: editValue.trim() };
      const { data, ok } = await apiFetch('/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (ok) {
        setProfile(prev => ({ ...prev, [editingField]: editValue.trim() }));
        Alert.alert('Éxito', 'Campo actualizado correctamente');
        setEditingField(null);
        setEditValue('');
      } else {
        Alert.alert('Error', data?.detail || 'Error al actualizar el campo');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!passwordValid) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
      return;
    }

    // Limpiar errores previos
    setServerError('');

    setPasswordLoading(true);
    try {
      const { data, ok } = await apiFetch('/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (ok) {
        Alert.alert('Éxito', 'Contraseña cambiada correctamente');
        setPasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setServerError('');
      } else {
        // Mostrar error del servidor en el modal
        const errorMessage = data?.detail || 'Error al cambiar la contraseña';
        setServerError(errorMessage);
        console.error('[EditProfile] Error del servidor:', errorMessage);
      }
    } catch (error) {
      console.error('[EditProfile] Error de conexión:', error);
      setServerError('Error de conexión. Intente nuevamente.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderField = (field, label, value, keyboardType = 'default') => {
    const isEditing = editingField === field;
    
    return (
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>{label}</Text>
        <View style={[
          styles.fieldRow,
          { backgroundColor: isDark ? '#333' : '#f8f9fa' }
        ]}>
          {isEditing ? (
            <>
              <TextInput
                style={[
                  styles.editInput,
                  { 
                    color: isDark ? '#fff' : '#333',
                    backgroundColor: 'transparent'
                  }
                ]}
                value={editValue}
                onChangeText={setEditValue}
                keyboardType={keyboardType}
                autoFocus
                onSubmitEditing={saveField}
                placeholderTextColor={isDark ? '#999' : '#666'}
              />
              <TouchableOpacity
                style={[styles.iconButton, styles.saveButton]}
                onPress={saveField}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.cancelButton]}
                onPress={cancelEditing}
                disabled={loading}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[
                styles.fieldValue,
                { color: isDark ? '#fff' : '#333' }
              ]}>
                {value || 'No especificado'}
              </Text>
              <TouchableOpacity
                style={[styles.iconButton, styles.editButton]}
                onPress={() => startEditing(field, value)}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  if (loadingProfile) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color={TITLE_COLOR} />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>Editar Perfil</Text>
      
      {renderField('full_name', 'Nombre Completo', profile.full_name)}
      {renderField('email', 'Correo Electrónico', profile.email, 'email-address')}
      {renderField('phone_number', 'Número de Teléfono', profile.phone_number, 'phone-pad')}
      {renderField('address', 'Dirección', profile.address)}

      <View style={styles.passwordSection}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Seguridad
        </Text>
        <TouchableOpacity
          style={[styles.passwordButton, { backgroundColor: TITLE_COLOR }]}
          onPress={() => {
            setPasswordModalVisible(true);
            setServerError(''); // Limpiar errores previos
          }}
        >
          <Ionicons name="lock-closed" size={20} color="#fff" />
          <Text style={styles.passwordButtonText}>Cambiar Contraseña</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Cambio de Contraseña */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.passwordModal, isDark && styles.passwordModalDark]}>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
              Cambiar Contraseña
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
                Contraseña Actual
              </Text>
              <TextInput
                style={[styles.passwordInput, isDark && styles.passwordInputDark]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Ingrese su contraseña actual"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
              {passwordErrors.currentPassword && (
                <Text style={styles.errorText}>{passwordErrors.currentPassword}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
                Nueva Contraseña
              </Text>
              <TextInput
                style={[styles.passwordInput, isDark && styles.passwordInputDark]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Ingrese la nueva contraseña"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
              {passwordErrors.newPassword && (
                <Text style={styles.errorText}>{passwordErrors.newPassword}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
                Confirmar Nueva Contraseña
              </Text>
              <TextInput
                style={[styles.passwordInput, isDark && styles.passwordInputDark]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirme la nueva contraseña"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
              {passwordErrors.confirmPassword && (
                <Text style={styles.errorText}>{passwordErrors.confirmPassword}</Text>
              )}
            </View>

            {serverError ? (
              <View style={styles.inputContainer}>
                <Text style={[styles.errorText, { textAlign: 'center', marginTop: 10 }]}>
                  {serverError}
                </Text>
              </View>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setServerError('');
                }}
                disabled={passwordLoading}
              >
                <Text style={styles.cancelModalText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: passwordValid ? TITLE_COLOR : DISABLED_COLOR },
                ]}
                onPress={changePassword}
                disabled={!passwordValid || passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveModalText}>Cambiar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#111',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  titleDark: {
    color: '#fff',
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  fieldLabelDark: {
    color: '#fff',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fieldValue: {
    flex: 1,
    fontSize: 16,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: TITLE_COLOR,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#E53935',
  },
  passwordSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  passwordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  passwordModalDark: {
    backgroundColor: '#222',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalTitleDark: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputLabelDark: {
    color: '#fff',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  passwordInputDark: {
    borderColor: '#444',
    color: '#fff',
    backgroundColor: '#333',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelModalButton: {
    backgroundColor: '#f1f3f4',
  },
  cancelModalText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

export default EditProfile;
