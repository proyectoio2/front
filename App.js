import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, useColorScheme, Text, Platform } from 'react-native';
import { AuthProvider, AuthContext, useAuth } from './core/AuthContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import NetworkCheck from './components/NetworkCheck';
import { Ionicons } from '@expo/vector-icons';

import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Profile from './screens/Profile';
import PasswordRecoveryScreen from './screens/PasswordRecoveryScreen';
import EditProfile from './screens/EditProfile';
import ChangePassW from './screens/ChangePassW';

const Stack = createNativeStackNavigator();

function AppContent() {
  const colorScheme = useColorScheme();
  const { loading, accessToken } = useAuth();
  console.log(accessToken);
  console.log(loading)
  
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#111' : '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#333', fontSize: 18 }}>Cargando...</Text>
      </View>
    );
  }
  
  return (
    <NetworkCheck>
      <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colorScheme === 'dark' ? '#111' : '#fff', elevation: 0, shadowOpacity: 0 },
            headerTitleAlign: 'left',
            headerTransparent: false,
            headerSafeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
          }}
        >
          {!accessToken ? (
            <>
              <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
              <Stack.Screen name="PasswordRecovery" component={PasswordRecoveryScreen} options={{ headerShown: false }} />
            </>
          ) : (
            <>
              <Stack.Screen 
                name="Home" 
                component={Home} 
                options={({ navigation }) => ({
                  title: 'EcoStylo',
                  headerRight: () => (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Profile')}
                      style={{ marginRight: 15 }}
                    >
                      <Ionicons 
                        name="person-circle-outline" 
                        size={28} 
                        color={colorScheme === 'dark' ? '#fff' : '#333'} 
                      />
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen name="Profile" component={Profile} options={{ title: 'Perfil' }} />
              <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Editar Perfil' }} />
              <Stack.Screen name="ChangePassW" component={ChangePassW} options={{ title: 'Cambiar contraseña' }} />
            </>
          )}
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </NetworkCheck>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}> 
          <AppContent />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
