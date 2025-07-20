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
import { Ionicons } from '@expo/vector-icons';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const BottomSheetModal = ({ visible, onClose, title, options = [] }) => {
  console.log('BottomSheetModal options:', options);

  // Verificar que options sea iterable y convertir a array para evitar error
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {[...safeOptions].map(({ label, onPress, destructive, icon }, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.button, destructive && styles.destructiveButton]}
            onPress={() => {
              onPress();
              onClose();
            }}
          >
            {icon && <Ionicons name={icon} size={20} color={destructive ? '#E53935' : '#333'} style={styles.buttonIcon} />}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  destructiveButton: {
    backgroundColor: '#ffebee',
  },
  destructiveText: {
    color: '#E53935',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default BottomSheetModal;
