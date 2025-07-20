import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

const EditarProductos = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }]}> 
      <Text style={[styles.title, isDark && { color: '#fff' }]}>Edición de productos</Text>
      <Text style={[styles.subtitle, isDark && { color: '#bbb' }]}>Aquí podrás agregar, editar o eliminar productos (próximamente).</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
});

export default EditarProductos; 