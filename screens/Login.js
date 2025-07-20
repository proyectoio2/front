import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, ActivityIndicator, useColorScheme} from 'react-native';
import CustomInput from '../components/CustomInput';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../core/AuthContext';
import { apiFetch } from '../core/api';



const TITLE_COLOR = '#4CAF50';
const DISABLED_COLOR = '#81C784';



const Login = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const errs = {};
    if (!email.trim()) errs.email = 'El usuario es obligatorio';
    if (!password)         errs.password = 'La contraseña es obligatoria';
    setErrors(errs);
    setValid(Object.keys(errs).length === 0);
  }, [email, password]);

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    if (!valid) return;

    setLoading(true);
    setModalMessage('');
    try {
      const { data, ok } = await apiFetch('/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password,
        }),
      });
      
      if (!ok) {
        const errorMessage = data?.detail || 'Error al iniciar sesión';
        setModalMessage(errorMessage);
        setModalVisible(true);
      } else {
        // Guardar ambos tokens y expiraciones
        console.log("DATA: ",data);
        console.log('accessToken:', data.data.access_token);
        await login(
          data.data.access_token,
          data.data.expires_in || 1800,
          data.data.refresh_token,
          data.data.refresh_expires_in || 604800,
          data.data.user // <-- PASAR PERFIL DE USUARIO
        );
        console.log('accessToken:', accessToken);
       //navigation.navigate('Home', { screen: 'Inicio' });

      }
    } catch (e) {
      setModalMessage('Error de red, inténtalo más tarde.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.dark]}>
      <Text style={[styles.welcome, isDark && styles.darkWelcome]}>Bienvenido a</Text>
      <Text style={[styles.floraFind, isDark && styles.darkFloraFind]}>EcoStylo</Text>
      <CustomInput
        label="Email"
        placeholder="Ingrese su email"
        value={email}
        onChangeText={text => {
          setEmail(text);
          if (!touched.email) setTouched(t => ({ ...t, email: true }));
        }}
        error={touched.email ? errors.email : ''}
      />
      <CustomInput
        label="Contraseña"
        placeholder="Ingrese su contraseña"
        value={password}
        onChangeText={text => {
          setPassword(text);
          if (!touched.password) setTouched(t => ({ ...t, password: true }));
        }}
        secureText
        error={touched.password ? errors.password : ''}
      />

      <TouchableOpacity onPress={() => navigation.navigate('PasswordRecovery')} style={{ alignSelf: 'flex-start' }}>
        <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: valid ? TITLE_COLOR : DISABLED_COLOR,
            opacity: loading ? 0.6 : 1,
          },
        ]}
        onPress={handleLogin}
        disabled={!valid || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: TITLE_COLOR }]}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.buttonText}>Crear cuenta</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, isDark && styles.modalViewDark]}>
            <Text style={[styles.modalText, isDark && styles.darkModalText]}>{modalMessage}</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title:          { fontSize: 32, fontWeight: 'bold', color: TITLE_COLOR, marginBottom: 24, textAlign: 'center' },
  row:            { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rememberText:   { marginLeft: 8, color: '#333' },
  forgot: {
    color: '#1976d2', // Azul para diferenciarlo de los botones verdes
    marginVertical: 0,
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 18,
    marginTop: 2,
    alignSelf: 'flex-start',
    textDecorationLine: 'underline',
    letterSpacing: 0.2,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: TITLE_COLOR, // Verde siempre, sin importar el modo
  },
  buttonDisabled: {
    backgroundColor: '#607d8b', // Verde apagado para deshabilitado
  },
  buttonActive: {
    backgroundColor: TITLE_COLOR, // Verde normal para activo
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView:   {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView:      {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewDark: {
    backgroundColor: '#222',
  },
  buttonClose:    {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  textStyle:      { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  modalText:      { marginBottom: 12, textAlign: 'center', color: '#333' },
  welcome:        { fontSize: 22, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', marginBottom: 0 },
  floraFind:      { fontSize: 32, fontWeight: 'bold', color: '#388e3c', textAlign: 'center', marginBottom: 18 },
  darkWelcome:    { color: '#aed581' },
  darkFloraFind:  { color: '#fff' },

  // Modo oscuro
  dark: {
    backgroundColor: '#111',
  },
  darkRememberText: {
    color: '#bbb',
  },
  darkForgot: {
    color: '#90caf9',
  },
  darkModalText: {
    color: '#eee',
  },
});

export default Login;
