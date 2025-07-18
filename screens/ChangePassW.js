import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  useColorScheme,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import { useAuth } from '../core/AuthContext';
import { useNavigation } from '@react-navigation/native';

const TITLE_COLOR = '#4CAF50';
const DISABLED_COLOR = '#81C784';

const ChangePassW = () => {
  const { accessToken } = useAuth();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Estados para contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Validaciones y touched
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modales
  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalWrongPasswordVisible, setModalWrongPasswordVisible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');

  // VALIDACIONES
  useEffect(() => {
    const errs = {};
    if (!currentPassword) {
      errs.currentPassword = 'La contraseña actual es obligatoria';
    }
    if (!newPassword) {
      errs.newPassword = 'La nueva contraseña es obligatoria';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
    }
    if (!confirmNewPassword) {
      errs.confirmNewPassword = 'Debe confirmar la nueva contraseña';
    } else if (confirmNewPassword !== newPassword) {
      errs.confirmNewPassword = 'Las contraseñas no coinciden';
    }
    setErrors(errs);
    setValid(Object.keys(errs).length === 0);
  }, [currentPassword, newPassword, confirmNewPassword]);

  // Al presionar "Guardar contraseña"
  const onPressGuardarContraseña = () => {
    console.log('[ChangePassW] Botón Guardar Contraseña presionado');
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmNewPassword: true,
    });
    if (!valid) {
      console.log('[ChangePassW] Validación fallida, errores:', errors);
      Alert.alert('Error', 'Por favor corrige los errores en el formulario.');
      return;
    }
    setModalConfirmVisible(true);
  };

  // Enviar PUT /auth/me
  const handleSavePassword = async () => {
    setModalConfirmVisible(false);
    setLoading(true);
    const body = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    console.log('[ChangePassW] Enviando PUT /auth/me con body:', body);

    try {
      const response = await fetch('https://florafind-aau6a.ondigitalocean.app/auth/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      const respText = await response.text();
      let respJson = null;
      try { respJson = JSON.parse(respText); } catch {}
      console.log('[ChangePassW] Respuesta backend:', response.status, respJson || respText);

      if (response.ok) {
        setModalSuccessVisible(true);
      } else if (response.status === 400 && respJson?.detail?.includes('401')) {
        console.warn('[ChangePassW] Contraseña actual incorrecta');
        setModalWrongPasswordVisible(true);
      } else {
        const errorMsg = respJson?.detail || 'Error al cambiar la contraseña';
        setModalErrorMessage(errorMsg);
        setModalErrorVisible(true);
      }
    } catch (err) {
      console.error('[ChangePassW] Error de red:', err);
      setModalErrorMessage('No se pudo conectar al servidor');
      setModalErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setModalSuccessVisible(false);
    navigation.navigate('Home', { screen: 'Perfil' });
  }; 
  const closeWrongPasswordModal = () => {
    setModalWrongPasswordVisible(false);
    setCurrentPassword('');
    setTouched(prev => ({ ...prev, currentPassword: false }));
  };
  const closeErrorModal = () => {
    setModalErrorVisible(false);
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }, { paddingHorizontal: 24 }]}>
      <Text style={[styles.title, isDark && { color: TITLE_COLOR }]}>Cambiar contraseña</Text>

      <CustomInput
        label="Contraseña actual"
        placeholder="Ingrese su contraseña actual"
        value={currentPassword}
        onChangeText={text => {
          setCurrentPassword(text);
          if (!touched.currentPassword) setTouched(prev => ({ ...prev, currentPassword: true }));
        }}
        secureText
        error={touched.currentPassword ? errors.currentPassword : ''}
      />

      <CustomInput
        label="Nueva contraseña"
        placeholder="Ingrese su nueva contraseña"
        value={newPassword}
        onChangeText={text => {
          setNewPassword(text);
          if (!touched.newPassword) setTouched(prev => ({ ...prev, newPassword: true }));
        }}
        secureText
        error={touched.newPassword ? errors.newPassword : ''}
      />

      <CustomInput
        label="Repita nueva contraseña"
        placeholder="Repita su nueva contraseña"
        value={confirmNewPassword}
        onChangeText={text => {
          setConfirmNewPassword(text);
          if (!touched.confirmNewPassword) setTouched(prev => ({ ...prev, confirmNewPassword: true }));
        }}
        secureText
        error={touched.confirmNewPassword ? errors.confirmNewPassword : ''}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: valid ? TITLE_COLOR : DISABLED_COLOR, opacity: loading ? 0.7 : 1 },
            isDark && { backgroundColor: valid ? '#33691e' : '#607d8b' },
          ]}
          onPress={onPressGuardarContraseña}
          disabled={!valid || loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Guardar contraseña'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { marginTop: 12 }]}
                  onPress={() => navigation.navigate('Home', { screen: 'Perfil' })}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
                </TouchableOpacity>
      </View>

      {/* Modal Confirmación */}
      <Modal visible={modalConfirmVisible} transparent animationType="fade" onRequestClose={() => setModalConfirmVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Confirmar acción</Text>
            <Text style={styles.confirmMessage}>¿Desea cambiar su contraseña?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelButtonModal]} onPress={() => setModalConfirmVisible(false)}>
                <Text style={styles.cancelButtonTextModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButtonModal]} onPress={handleSavePassword}>
                <Text style={styles.saveButtonTextModal}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Éxito */}
      <Modal visible={modalSuccessVisible} transparent animationType="fade" onRequestClose={closeSuccessModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Éxito</Text>
            <Text style={styles.confirmMessage}>Contraseña cambiada con éxito</Text>
            <TouchableOpacity style={[styles.button, styles.saveButtonModal, { marginTop: 10, width: '60%' }]} onPress={closeSuccessModal}>
              <Text style={styles.saveButtonTextModal}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Contraseña Incorrecta */}
      <Modal visible={modalWrongPasswordVisible} transparent animationType="fade" onRequestClose={closeWrongPasswordModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Error</Text>
            <Text style={styles.confirmMessage}>Contraseña actual incorrecta</Text>
            <TouchableOpacity style={[styles.button, styles.saveButtonModal, { marginTop: 10, width: '60%' }]} onPress={closeWrongPasswordModal}>
              <Text style={styles.saveButtonTextModal}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Error Genérico */}
      <Modal visible={modalErrorVisible} transparent animationType="fade" onRequestClose={closeErrorModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Error</Text>
            <Text style={styles.confirmMessage}>{modalErrorMessage}</Text>
            <TouchableOpacity style={[styles.button, styles.saveButtonModal, { marginTop: 10, width: '60%' }]} onPress={closeErrorModal}>
              <Text style={styles.saveButtonTextModal}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: TITLE_COLOR, marginBottom: 24, textAlign: 'center' },
  buttonContainer: { marginTop: 16, paddingHorizontal: 24 },
  button: { paddingVertical: 14, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  cancelButton: {backgroundColor: '#ccc',paddingVertical: 14,borderRadius: 8,marginTop: 12 },
  cancelButtonText: { color: '#333', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  confirmModal: { backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', alignItems: 'center' },
  confirmTitle: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  confirmMessage: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
  confirmButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  cancelButtonModal: { backgroundColor: '#ccc', flex: 1, marginRight: 10, borderRadius: 8, paddingVertical: 14 },
  cancelButtonTextModal: { color: '#333', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  saveButtonModal: { backgroundColor: '#4CAF50', flex: 1, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  saveButtonTextModal: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});

export default ChangePassW;
