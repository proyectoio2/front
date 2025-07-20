import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, useColorScheme, ActivityIndicator, Modal, Pressable } from 'react-native';
import CustomInput from '../components/CustomInput';
import { apiFetch } from '../core/api';

export default function PasswordRecoveryScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [valid, setValid] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Validar email reactivo
  React.useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setValid(emailRegex.test(email));
    setErrorMsg('');
    setSuccess(false);
  }, [email]);

  const handleSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    setSuccess(false);
    setErrorMsg('');
    try {
      const { data: result, ok } = await apiFetch('/auth/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      });
      let apiMessage = '';
      if (ok) {
        apiMessage = result.message || '¡Solicitud enviada! Revisa tu correo electrónico.';
        setSuccess(true);
        setModalMessage(apiMessage);
        setModalVisible(true);
      } else {
        if (result.detail) {
          if (Array.isArray(result.detail)) {
            apiMessage = result.detail.map(d => d.msg || JSON.stringify(d)).join('\n');
          } else {
            apiMessage = result.detail;
          }
        } else {
          apiMessage = 'Algo salió mal.';
        }
        setModalMessage(apiMessage);
        setModalVisible(true);
      }
    } catch (error) {
      setModalMessage('Error de red o del servidor.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    if (success) {
      navigation.replace('Login');
    }
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }, { paddingHorizontal: 24 }]}>
      <Text style={[styles.title, isDark && { color: '#8bc34a' }]}>Recuperar contraseña</Text>
      <Text style={[styles.subtitle, isDark && { color: '#bbb' }]}>
        Introduce tu correo electrónico para restablecer tu contraseña.
      </Text>
      <CustomInput
        label="Correo electrónico"
        placeholder="Ingrese su correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        error={''}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: valid ? '#4CAF50' : '#81C784', opacity: loading ? 0.6 : 1 },
        ]}
        onPress={handleSubmit}
        disabled={!valid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendButtonText}>Enviar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.backButton,
          { backgroundColor: isDark ? '#333' : '#f1f3f4' }
        ]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={[
          styles.backButtonText,
          { color: isDark ? '#fff' : '#666' }
        ]}>
          Volver
        </Text>
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, isDark && styles.modalViewDark]}>
            <Text style={[styles.modalText, isDark && styles.darkModalText]}>{modalMessage}</Text>
            <Pressable
              style={[styles.sendButton, { backgroundColor: '#388e3c', marginBottom: 0, minWidth: 120 }]}
              onPress={handleCloseModal}
            >
              <Text style={[styles.sendButtonText, { fontSize: 16 }]}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  darkModalText: {
    color: '#fff',
  },
  modalViewDark: {
    backgroundColor: '#222',
    borderColor: '#444',
    borderWidth: 1,
  },
});
