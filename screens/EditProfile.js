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

const EditProfile = () => {
  const { accessToken } = useAuth();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Estados para los campos email y username
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  // Validaciones y touched
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ email: false, username: false });
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modales
  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');

  // VALIDACIONES: al menos un campo debe estar lleno y sin errores individuales
  useEffect(() => {
    const errs = {};
    // validar email solo si el usuario escribió algo
    if (email.trim()) {
      if (!email.includes('@')) {
        errs.email = 'Ingrese un correo electrónico válido';
      }
    }
    // validar username solo si el usuario escribió algo
    if (username.trim()) {
      // aquí podrías añadir más reglas si lo deseas
      if (username.trim().length === 0) {
        errs.username = 'El nombre de usuario es obligatorio';
      }
    }
    setErrors(errs);

    // determinar validez: al menos un campo no vacío y sin error correspondiente
    const emailOk = email.trim() && !errs.email;
    const usernameOk = username.trim() && !errs.username;
    setValid(Boolean(emailOk || usernameOk));
  }, [email, username]);

  // Al presionar "Guardar cambios"
  const onPressGuardarCambios = () => {
    console.log('[EditProfile] Botón Guardar Cambios presionado');
    setTouched({ email: true, username: true });
    if (!valid) {
      console.log('[EditProfile] Validación fallida, errores:', errors);
      Alert.alert('Error', 'Por favor completa al menos un campo correctamente.');
      return;
    }
    setModalConfirmVisible(true);
  };

  // Enviar PUT /auth/me
  const handleGuardarConfirmado = async () => {
    setModalConfirmVisible(false);
    setLoading(true);

    // construir body con solo los campos que el usuario llenó
    const body = {};
    if (email.trim()) body.email = email.trim();
    if (username.trim()) body.username = username.trim();

    console.log('[EditProfile] Enviando PUT /auth/me con body:', body);

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
      console.log('[EditProfile] Respuesta backend:', response.status, respJson || respText);

      if (response.ok) {
        setModalSuccessVisible(true);
      } else {
        const errorMsg = respJson?.detail || 'Error al actualizar perfil';
        setModalErrorMessage(errorMsg);
        setModalErrorVisible(true);
      }
    } catch (err) {
      console.error('[EditProfile] Error de red:', err);
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
  const closeErrorModal = () => {
    setModalErrorVisible(false);
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }, { paddingHorizontal: 24 }]}>
      <Text style={[styles.title, isDark && { color: TITLE_COLOR }]}>Editar perfil</Text>

      <CustomInput
        label="Correo electrónico"
        placeholder="Ingrese su correo electrónico"
        value={email}
        onChangeText={text => {
          setEmail(text);
          if (!touched.email) setTouched(prev => ({ ...prev, email: true }));
        }}
        keyboardType="email-address"
        error={touched.email ? errors.email : ''}
      />

      <CustomInput
        label="Nombre de usuario"
        placeholder="Ingrese su nombre de usuario"
        value={username}
        onChangeText={text => {
          setUsername(text);
          if (!touched.username) setTouched(prev => ({ ...prev, username: true }));
        }}
        error={touched.username ? errors.username : ''}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: valid ? TITLE_COLOR : DISABLED_COLOR, opacity: loading ? 0.7 : 1 },
            isDark && { backgroundColor: valid ? '#33691e' : '#607d8b' },
          ]}
          onPress={onPressGuardarCambios}
          disabled={!valid || loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.navigate('Home', { screen: 'Perfil' })}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Confirmación */}
      <Modal visible={modalConfirmVisible} transparent animationType="fade" onRequestClose={() => setModalConfirmVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Confirmar cambios</Text>
            <Text style={styles.confirmMessage}>¿Está seguro de editar la información del perfil?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelButtonModal]} onPress={() => setModalConfirmVisible(false)}>
                <Text style={styles.cancelButtonTextModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButtonModal]} onPress={handleGuardarConfirmado}>
                <Text style={styles.saveButtonTextModal}>Guardar</Text>
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
            <Text style={styles.confirmMessage}>Cambios guardados con éxito</Text>
            <TouchableOpacity style={[styles.button, styles.saveButtonModal, { marginTop: 10, width: '60%' }]} onPress={closeSuccessModal}>
              <Text style={styles.saveButtonTextModal}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Error */}
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

  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

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

export default EditProfile;
