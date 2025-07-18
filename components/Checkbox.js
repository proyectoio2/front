import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

const Checkbox = ({ checked, onToggle }) => (
  <TouchableOpacity onPress={onToggle} style={styles.box}>
    {checked && <View style={styles.inner} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  box: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inner: {
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 2
  }
});

export default Checkbox;
