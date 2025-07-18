import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, useColorScheme, Modal, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import CustomInput from '../components/CustomInput';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../core/api';

const TITLE_COLOR = '#4CAF50';
const DISABLED_COLOR = '#81C784'; // Igual que en Login.js

const Register = ({ onBack }) => {
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState(false);
  const [touched, setTouched] = useState({
    full_name: false,
    phone: false,
    email: false,
    address: false,
    password: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const errs = {};
    if (!full_name.trim()) errs.full_name = 'El nombre completo es obligatorio';
    else if (full_name.length < 5) errs.full_name = 'Mínimo 5 caracteres';
    else if (full_name.length > 100) errs.full_name = 'Máximo 100 caracteres';
    if (!email.trim() || !email.includes('@'))
      errs.email = 'Ingrese un correo electrónico válido';
    else if (email.length < 5) errs.email = 'Mínimo 5 caracteres';
    else if (email.length > 100) errs.email = 'Máximo 100 caracteres';
    if (!address.trim()) errs.address = 'La dirección es obligatoria';
    else if (address.length < 5) errs.address = 'Mínimo 5 caracteres';
    else if (address.length > 100) errs.address = 'Máximo 100 caracteres';
    // Validación de contraseña: mínimo 8, al menos un número y un caracter especial
    if (!password || password.length < 8)
      errs.password = 'La contraseña debe tener al menos 8 caracteres';
    else if (!/(?=.*[0-9])/.test(password))
      errs.password = 'La contraseña debe contener al menos un número';
    else if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password))
      errs.password = 'Debe contener al menos un caracter especial';
    else if (password.length > 100) errs.password = 'Máximo 100 caracteres';
    if (confirm !== password) errs.confirm = 'Las contraseñas no coinciden';
    if (!/^([67][0-9]{7})$/.test(phone)) {
      errs.phone = 'Ingrese un número válido (8 dígitos, inicia con 6 o 7)';
    }
    setErrors(errs);
    setValid(Object.keys(errs).length === 0);
  }, [full_name, email, password, confirm, phone, address]);

  const handleRegister = async () => {
    setLoading(true);
    setServerError('');
    setSuccessMsg('');
    try {
      const { data: result, ok } = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, phone_number: phone, address, password }),
      });
      if (ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigation.navigate('Login');
        }, 1800);
      } else {
        setServerError(result.detail || 'Error al registrar.');
      }
    } catch (e) {
      setServerError('Error de red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={[styles.container, isDark && { backgroundColor: '#111' }, { paddingHorizontal: 24 }]}>
          <CustomInput
            label="Nombre completo"
            placeholder="Ingrese su nombre completo"
            value={full_name}
            onChangeText={text => {
              setFullName(text);
              if (!touched.full_name) setTouched({ ...touched, full_name: true });
            }}
            error={touched.full_name ? errors.full_name : ''}
          />

          <CustomInput
            label="Correo electronico"
            placeholder="Ingrese su correo electronico"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (!touched.email) setTouched({ ...touched, email: true });
            }}
            keyboardType="email-address"
            error={touched.email ? errors.email : ''}
          />

          <CustomInput
              label="Dirección para envíos"
              placeholder="Ingrese su dirección"
              value={address}
              onChangeText={text => {
                setAddress(text);
                if (!touched.address) setTouched({ ...touched, address: true });
              }}
              keyboardType="text"
              error={touched.address ? errors.address : ''}
          />

          <CustomInput
            label="Celular"
            placeholder="Ingrese su numero de celular"
            value={phone}
            onChangeText={text => {
              const onlyNums = text.replace(/[^0-9]/g, '');
              setPhone(onlyNums);
              if (!touched.phone) setTouched({ ...touched, phone: true });
            }}
            keyboardType="phone-pad"
            error={touched.phone ? errors.phone : ''}
            leftIcon={<Text style={{ fontSize: 22 }}>🇧🇴</Text>}
          />

          <CustomInput
            label="Contraseña"
            placeholder="Ingrese su contraseña"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (!touched.password) setTouched({ ...touched, password: true });
            }}
            secureText
            error={touched.password ? errors.password : ''}
          />

          <CustomInput
            label="Confirmar contraseña"
            placeholder="Repita su contraseña"
            value={confirm}
            onChangeText={text => {
              setConfirm(text);
              if (!touched.confirm) setTouched({ ...touched, confirm: true });
            }}
            secureText
            error={touched.confirm ? errors.confirm : ''}
          />

          {serverError ? <Text style={styles.error}>{typeof serverError === 'string' ? serverError : Array.isArray(serverError) ? serverError.map(e => e.msg || JSON.stringify(e)).join(', ') : JSON.stringify(serverError)}</Text> : null}
          {successMsg ? <Text style={[styles.error, { color: 'green' }]}>{successMsg}</Text> : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: valid ? TITLE_COLOR : DISABLED_COLOR, opacity: loading ? 0.7 : 1 },
              ]}
              onPress={handleRegister}
              disabled={!valid || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.backLink, isDark && { backgroundColor: '#263238' }]} onPress={onBack || (() => navigation.goBack())}>
              <Text style={[styles.backButtonText, isDark && { color: '#aed581' }]}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconCircle}>
              <Text style={{ fontSize: 40 }}>✅</Text>
            </View>
            <Text style={styles.successTitle}>¡Cuenta creada!</Text>
            <Text style={styles.successMsg}>Redirigiendo...</Text>
            <ActivityIndicator color="#4CAF50" style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TITLE_COLOR,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: { marginTop: 16 },
  button: { paddingVertical: 14, borderRadius: 8, marginBottom: 12 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backLink: { alignItems: 'center', marginTop: 8, backgroundColor: '#e7f6e9', borderRadius: 10,
    paddingVertical: 14},
  error: { color: 'red', fontSize: 12, marginTop: 8 },
  backButtonText: {
    color: '#54a468',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  successMsg: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default Register;