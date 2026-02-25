import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { AuthProvider } from '@/contexts/AuthContext';
import { PropertyProvider } from '@/contexts/PropertyContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <PropertyProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/register" />
              <Stack.Screen name="auth/forgot-password" />
              <Stack.Screen name="dashboard" />
              <Stack.Screen name="properties/list" />
              <Stack.Screen name="properties/detail" />
              <Stack.Screen name="properties/add" />
              <Stack.Screen name="properties/my-listings" />
              <Stack.Screen name="properties/favorites" />
            </Stack>
          </PropertyProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
