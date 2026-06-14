import { Stack } from 'expo-router';

export default function AdminLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Panel Admin', headerShown: false }} />
            <Stack.Screen name="auditoria" options={{ title: 'Auditoría', headerShown: false }} />
            <Stack.Screen name="estadisticas" options={{ title: 'Estadísticas', headerShown: false }} />
            <Stack.Screen name="solicitudes" options={{ title: 'Solicitudes', headerShown: false }} />
        </Stack>
    );
}