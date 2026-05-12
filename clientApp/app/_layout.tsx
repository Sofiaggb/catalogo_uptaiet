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

        <Stack.Screen
          name="tesis/edit/[id]"
          options={{
            presentation: 'modal',
            title: 'Editar Tesis'
          }}
        />

        <Stack.Screen
          name="carreras/create"
          options={{
            presentation: 'modal',
            title: 'Crear Carrera'
          }}
        />

        <Stack.Screen
          name="carreras/edit/[id]"
          options={{
            presentation: 'modal',
            title: 'Editar Carrera'
          }}
        />

        <Stack.Screen
          name="materias/create"
          options={{
            presentation: 'modal',
            title: 'Crear Carrera'
          }}
        />

        <Stack.Screen
          name="materias/edit/[id]"
          options={{
            presentation: 'modal',
            title: 'Editar Carrera'
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}