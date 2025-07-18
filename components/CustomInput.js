import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureText,
  error,
  keyboardType = 'default',
  style,
  leftIcon // Nuevo prop opcional
}) => {
  const [hidden, setHidden] = useState(!!secureText);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && { color: '#eee' }]}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        !!error && styles.inputWrapperError,
        isDark && { backgroundColor: '#222', borderColor: '#444', shadowColor: '#000' },
        style,
      ]}>
        {leftIcon && (
          <View style={{ marginRight: 8 }}>{leftIcon}</View>
        )}
        <TextInput
          style={[styles.input, isDark && { color: '#fff' }]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
          selectionColor="#4CAF50"
        />
        {secureText && (
          <TouchableOpacity onPress={() => setHidden((h) => !h)}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#4CAF50"
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  label: { fontWeight: 'bold', marginBottom: 6, color: '#333', fontSize: 15 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#B2DFDB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
    backgroundColor: '#FAFAFA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: '#E57373',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#222',
    paddingVertical: 0,
    minHeight: 28,
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineStyle: 'none',
    boxShadow: 'none',
    includeFontPadding: false,
  },
  error: { color: '#E57373', marginTop: 4, fontSize: 13 },
});

export default CustomInput;