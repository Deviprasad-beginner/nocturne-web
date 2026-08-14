import React from 'react';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AuthScreen from './src/screens/AuthScreen';

/** Auth gate — shows AuthScreen until user is logged in */
function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050508', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#818cf8" size="large" />
      </View>
    );
  }

  return isAuthenticated ? <BottomTabNavigator /> : <AuthScreen />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor="#050508" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
