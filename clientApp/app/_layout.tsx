// // app/_layout.tsx 

// import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';
// import "../global.css";

// export default function RootLayout() {
//   return (
//     <ThemeProvider value={DefaultTheme}>
//       <Stack
//         screenOptions={{
//           headerShown: false,  //  oculta TODOS los headers por defecto
//         }}
//       >
//         {/* LAS TABS - grupo (tabs) */}
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

//         {/* PANTALLAS MODALES (fuera de tabs) */}
//         <Stack.Screen
//           name="tesis/create"
//           options={{
//             title: 'Crear Tesis',
//             presentation: 'modal'
//           }}
//         />

//         {/* Detalle de tesis (dentro de tabs pero se maneja automáticamente) */}
//         <Stack.Screen
//           name="tesis/[id]"
//           options={{
//             title: 'Detalle de Tesis',
//             headerStyle: { backgroundColor: '#000000' },
//             headerTitleStyle: { color: '#FFD700' }
//           }}
//         />

//         <Stack.Screen
//           name="tesis/edit/[id]"
//           options={{
//             presentation: 'modal',
//             title: 'Editar Tesis'
//           }}
//         />

//         <Stack.Screen
//           name="carreras/create"
//           options={{
//             presentation: 'modal',
//             title: 'Crear Carrera'
//           }}
//         />

//         <Stack.Screen
//           name="carreras/edit/[id]"
//           options={{
//             presentation: 'modal',
//             title: 'Editar Carrera'
//           }}
//         />

//         <Stack.Screen
//           name="materias/create"
//           options={{
//             presentation: 'modal',
//             title: 'Crear materia'
//           }}
//         />

//         <Stack.Screen
//           name="materias/edit/[id]"
//           options={{
//             presentation: 'modal',
//             title: 'Editar materia'
//           }}
//         />
//         {/* libros */}
//         <Stack.Screen
//           name="libros/create"
//           options={{
//             presentation: 'modal',
//             title: 'Crear libro'
//           }}
//         />

//         <Stack.Screen
//           name="libros/edit/[id]"
//           options={{
//             presentation: 'modal',
//             title: 'Editar libro'
//           }}
//         />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }

// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';
import "../global.css";

// Importar contexto de autenticación
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Componente interno que maneja la navegación según autenticación
function RootLayoutNav() {
    const { isAuthenticated, isLoading } = useAuth();

    // Mostrar loading mientras se verifica autenticación
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            {!isAuthenticated ? (
                // ============================================
                // RUTAS DE AUTENTICACIÓN (sin tabs)
                // ============================================
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            ) : (
                // ============================================
                // RUTAS PRINCIPALES (con tabs)
                // ============================================
                <>
                {/* TABS - grupo principal */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                {/* PANTALLAS MODALES - Tesis */}
                <Stack.Screen
                    name="tesis/create"
                    options={{
                        title: 'Crear Tesis',
                        presentation: 'modal'
                    }}
                />
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

                {/* PANTALLAS MODALES - Carreras */}
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

                {/* PANTALLAS MODALES - Materias */}
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

                {/* PANTALLAS MODALES - Libros */}
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
                
                {/* PANTALLAS MODALES - Documentos/Recursos */}
                <Stack.Screen
                    name="recursos/create"
                    options={{
                        presentation: 'modal',
                        title: 'Agregar recurso'
                    }}
                />
                <Stack.Screen
                    name="recursos/edit/[id]"
                    options={{
                        presentation: 'modal',
                        title: 'Editar recurso'
                    }}
                />
                </>
            )}
        </Stack>
        
    );
}

// Layout principal con el proveedor de autenticación
export default function RootLayout() {
    return (
        <ThemeProvider value={DefaultTheme}>
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}