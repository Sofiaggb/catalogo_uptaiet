// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css";


import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
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

          {/* Detalle de tesis */}
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
              title: 'Crear materia'
            }}
          />

          <Stack.Screen
            name="materias/edit/[id]"
            options={{
              presentation: 'modal',
              title: 'Editar materia'
            }}
          />

          <Stack.Screen
            name="libros/create"
            options={{
              presentation: 'modal',
              title: 'Crear libro'
            }}
          />

          <Stack.Screen
            name="libros/edit/[id]"
            options={{
              presentation: 'modal',
              title: 'Editar libro'
            }}
          />
        </Stack>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}