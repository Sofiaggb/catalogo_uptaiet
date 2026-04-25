// app/_layout.tsx 

import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css";

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,  //  oculta TODOS los headers por defecto
        }}
      >
        {/* LAS TABS - grupo (tabs) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* PANTALLAS MODALES (fuera de tabs) */}
        <Stack.Screen 
          name="tesis/create" 
          options={{ 
            title: 'Crear Tesis',
            presentation: 'modal'
          }} 
        />
        
          {/* Detalle de tesis (dentro de tabs pero se maneja automáticamente) */}
        <Stack.Screen 
          name="tesis/[id]" 
          options={{ 
            title: 'Detalle de Tesis',
            headerStyle: { backgroundColor: '#000000' },
            headerTitleStyle: { color: '#FFD700' }
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}