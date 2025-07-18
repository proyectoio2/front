import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, BackHandler } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NetworkCheck = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Verificar conexión inicial
    checkConnection();

    // Suscribirse a cambios en la conexión
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected);
      if (!connected) {
        setModalVisible(true);
      }
    });

    // Bloquear el botón de retroceso cuando no hay conexión
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isConnected) {
        return true; // Previene el comportamiento por defecto
      }
      return false; // Permite el comportamiento por defecto
    });

    return () => {
      unsubscribe();
      backHandler.remove();
    };
  }, [isConnected]);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    const connected = state.isConnected && state.isInternetReachable;
    setIsConnected(connected);
    if (!connected) {
      setModalVisible(true);
    }
  };

  const handleRetry = async () => {
    const state = await NetInfo.fetch();
    const connected = state.isConnected && state.isInternetReachable;
    if (connected) {
      setModalVisible(false);
      setIsConnected(true);
    }
  };

  if (!isConnected) {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {}}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              No hay conexión a internet.{'\n'}
              Por favor, verifica tu conexión e intenta de nuevo.
            </Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={handleRetry}
            >
              <Text style={styles.textStyle}>Reintentar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
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
    fontSize: 16,
    color: '#333',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    backgroundColor: '#4CAF50',
  },
  buttonClose: {
    backgroundColor: '#4CAF50',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default NetworkCheck; 