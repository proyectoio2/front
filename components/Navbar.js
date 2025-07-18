import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg'; 


// Define the icon SVGs directly in the component with updated size and color
const HomeIcon = () => (
  <Svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
    <Path fill="#4CAF50" d="M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19" />
  </Svg>
);

const IdentificarIcon = () => (
  <Svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
    <Path fill="#4CAF50" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" />
  </Svg>
);

const JardinIcon = () => (
  <Svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 15 15">
    <Path fill="#4CAF50" d="M13 8c0 3.31-2.19 6-5.5 6S2 11.31 2 8a5.33 5.33 0 0 1 5 3.61V7H4.5A1.5 1.5 0 0 1 3 5.5v-3a.5.5 0 0 1 .9-.3l1.53 2l1.65-3a.5.5 0 0 1 .84 0l1.65 3l1.53-2a.5.5 0 0 1 .9.3v3A1.5 1.5 0 0 1 10.5 7H8v4.61A5.33 5.33 0 0 1 13 8" />
  </Svg>
);

const PerfilIcon = () => (
  <Svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
    <Path fill="#4CAF50" fillRule="evenodd" d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z" clipRule="evenodd"/>
  </Svg>
);

const Navbar = ({ accessToken }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Home')}
      >
        <HomeIcon />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Identificar')}
      >
        <IdentificarIcon />
        <Text style={styles.navText}>Identificar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Gardens', { accessToken })}
      >
        <JardinIcon />
        <Text style={styles.navText}>Jardin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Perfil')}
      >
        <PerfilIcon />
        <Text style={styles.navText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#4CAF50',
  },
});

export default Navbar;
