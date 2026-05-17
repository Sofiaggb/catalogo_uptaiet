// app/(tabs)/perfil/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function PerfilScreen() {
    const { user, isAuthenticated, logout } = useAuth();

    const handleLoginPress = () => {
        router.push('/(auth)/login');
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/(tabs)');
    };

    // Si NO está autenticado, mostrar pantalla de invitado
    if (!isAuthenticated) {
        return (
            <ScrollView className="flex-1 bg-white">

                <View className="p-5 items-center">
                    {/* Icono invitado */}
                    <View className="bg-gray-100 rounded-full p-8 mb-6 mt-10">
                        <Ionicons name="person-outline" size={80} color="#9CA3AF" />
                    </View>
                    
                    <Text className="text-2xl font-bold text-black mb-2">Invitado</Text>
                    <Text className="text-gray-500 text-center mb-8">
                        Inicia sesión para acceder a más funciones
                    </Text>

                    {/* Botón Iniciar Sesión */}
                    <TouchableOpacity
                        className="bg-blue-500 py-4 rounded-xl w-full mb-4"
                        onPress={handleLoginPress}
                    >
                        <Text className="text-white text-center text-lg font-bold">
                            Iniciar Sesión
                        </Text>
                    </TouchableOpacity>

                    {/* Botón Registrarse */}
                    <TouchableOpacity
                        className="bg-gray-100 py-4 rounded-xl w-full"
                        onPress={() => router.push('/(auth)/register')}
                    >
                        <Text className="text-gray-700 text-center text-lg font-bold">
                            Crear Cuenta
                        </Text>
                    </TouchableOpacity>

              
                </View>
            </ScrollView>
        );
    }

    // Si está autenticado, mostrar perfil completo
    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-5">
                {/* Avatar */}
                <View className="items-center mb-6">
                    <View className="bg-cyan-500 rounded-full p-6">
                        <Ionicons name="person-outline" size={60} color="#FFFFFF" />
                    </View>
                    <Text className="text-2xl font-bold text-black mt-3">{user?.nombre}</Text>
                    <View className="bg-blue-100 rounded-full px-3 py-1 mt-2">
                        <Text className="text-blue-700 text-sm">{user?.rol}</Text>
                    </View>
                </View>

                {/* Información */}
                <View className="bg-gray-50 rounded-2xl p-5 mb-6">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="mail-outline" size={22} color="#6B7280" />
                        <Text className="text-gray-700 ml-3">{user?.email}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={22} color="#6B7280" />
                        <Text className="text-gray-700 ml-3">Miembro desde {user?.fecha_creacion}</Text>
                    </View>
                </View>

                {/* Acciones */}
                <TouchableOpacity
                    className="bg-red-500 py-4 rounded-xl flex-row items-center justify-center"
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
                    <Text className="text-white font-bold ml-2">Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}