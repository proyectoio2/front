// components/BottomSheetModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const BottomSheetModal = ({ visible, onClose, title, options = [] }) => {
  console.log('BottomSheetModal options:', options);

  // Verificar que options sea iterable y convertir a array para evitar error
  const safeOptions = Array.isArray(options) ? options : [];

  // // Para debugging, render estático sin map (descomenta para probar)
/*
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.button} onPress={() => { safeOptions[0]?.onPress(); onClose(); }}>
          <Text style={styles.buttonText}>{safeOptions[0]?.label || 'Opción 1'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.destructiveButton]} onPress={() => { safeOptions[1]?.onPress(); onClose(); }}>
          <Text style={[styles.buttonText, styles.destructiveText]}>{safeOptions[1]?.label || 'Opción 2'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
*/

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {[...safeOptions].map(({ label, onPress, destructive }, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.button, destructive && styles.destructiveButton]}
            onPress={() => {
              onPress();
              onClose();
            }}
          >
            <Text style={[styles.buttonText, destructive && styles.destructiveText]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 30,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // boxShadow no existe en RN, eliminé para evitar conflictos
  },
  destructiveButton: {
    backgroundColor: '#ff0000',
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  destructiveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 16,
    backgroundColor: '#eee',
    borderRadius: 16,
  },
  cancelText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default BottomSheetModal;
