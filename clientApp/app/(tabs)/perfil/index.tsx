import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, Alert, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { perfilApi } from '@/services/api/endpoints/perfil';
import { STATIC_URL } from '@/config/env';
import * as ImagePicker from 'expo-image-picker';

export default function PerfilScreen() {
    // const { user, isAuthenticated, logout } = useAuth();
    const { user, isAuthenticated, logout, refreshUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    
    // Verificar si el usuario es administrador (rol 5) o tiene roles de gestión (3,4)
    const esAdmin = user?.id_rol === 3;
    const tieneAccesoAdmin = [3, 4, 5].includes(user?.id_rol ?? 0);

    const handleLoginPress = () => {
        router.push('/(auth)/login');
    };

    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Cerrar Sesión', 
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(tabs)');
                    }
                }
            ]
        );
    };

        const seleccionarFoto = async () => {
        // Solicitar permisos
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Error', 'Se necesitan permisos para acceder a la galería');
            return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: false,
        });
        
        if (!result.canceled && result.assets[0]) {
            subirFoto(result.assets[0].uri);
        }
    };

    const tomarFoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Error', 'Se necesitan permisos para usar la cámara');
            return;
        }
        
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        
        if (!result.canceled && result.assets[0]) {
            subirFoto(result.assets[0].uri);
        }
    };

    const subirFoto = async (uri: string) => {
        setUploading(true);
        
        const formData = new FormData();
        // @ts-ignore
        formData.append('foto', {
            uri,
            name: `perfil_${user?.id_usuario}.jpg`,
            type: 'image/jpeg',
        });
        
        const result = await perfilApi.subirFotoPerfil(formData);
        
        setUploading(false);
        
        if (result.success) {
            // Recargar datos del usuario
            await refreshUser();
            Alert.alert('Éxito', 'Foto de perfil actualizada');
        } else {
            Alert.alert('Error', result.message || 'No se pudo actualizar la foto');
        }
    };

    const eliminarFoto = async () => {
        Alert.alert(
            'Eliminar foto',
            '¿Estás seguro de que deseas eliminar tu foto de perfil?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await perfilApi.eliminarFotoPerfil();
                        if (result.success) {
                            await refreshUser();
                            Alert.alert('Éxito', 'Foto eliminada');
                        } else {
                            Alert.alert('Error', 'No se pudo eliminar la foto');
                        }
                    }
                }
            ]
        );
    };

    const mostrarOpcionesFoto = () => {
    const buttons: {
        text: string;
        style?: 'default' | 'cancel' | 'destructive';
        onPress?: () => void;
    }[] = [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Tomar foto', onPress: tomarFoto },
        { text: 'Elegir de galería', onPress: seleccionarFoto }
    ];
    
    if (user?.foto_perfil) {
        buttons.push({ 
            text: 'Eliminar foto', 
            style: 'destructive', 
            onPress: eliminarFoto 
        });
    }
    
    Alert.alert('Foto de perfil', '¿Cómo quieres agregar tu foto?', buttons);
};

    const navigateToAdmin = (screen: string) => {
        router.push(`./admin/${screen}`);
    };

    // Si NO está autenticado, mostrar pantalla de invitado
    if (!isAuthenticated) {
        return (
            <ScrollView className="flex-1 bg-white">
                <View className="p-5 items-center">
                    <View className="bg-gray-100 rounded-full p-8 mb-6 mt-10">
                        <Ionicons name="person-outline" size={80} color="#9CA3AF" />
                    </View>
                    
                    <Text className="text-2xl font-bold text-black mb-2">Invitado</Text>
                    <Text className="text-gray-500 text-center mb-8">
                        Inicia sesión para acceder a más funciones
                    </Text>

                    <TouchableOpacity
                        className="bg-cyan-500 py-4 rounded-xl w-full mb-4"
                        onPress={handleLoginPress}
                    >
                        <Text className="text-white text-center text-lg font-bold">
                            Iniciar Sesión
                        </Text>
                    </TouchableOpacity>

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

                {/* Avatar con opción de cambiar foto */}
                <View className="items-center mb-6">
                    <TouchableOpacity
                        onPress={mostrarOpcionesFoto}
                        disabled={uploading}
                        className="relative"
                    >
                        {uploading ? (
                            <View className="w-28 h-28 bg-cyan-500 rounded-full items-center justify-center">
                                <ActivityIndicator size="large" color="#FFFFFF" />
                            </View>
                        ) : user?.foto_perfil ? (
                            <Image
                                source={{ uri: `${STATIC_URL}${user.foto_perfil}` }}
                                className="w-28 h-28 rounded-full"
                            />
                        ) : (
                            <View className="bg-cyan-500 rounded-full p-6 w-28 h-28 items-center justify-center">
                                <Ionicons name="person-outline" size={60} color="#FFFFFF" />
                            </View>
                        )}
                        <View className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm">
                            <Ionicons name="camera-outline" size={20} color="#06b6d4" />
                        </View>
                    </TouchableOpacity>
                    
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
                        <Text className="text-gray-700 ml-3">Miembro desde {user?.fecha_creacion?.split('T')[0]}</Text>
                    </View>
                </View>

                {/* ==================== SECCIÓN DE ADMINISTRACIÓN ==================== */}
                {esAdmin && (
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-800 mb-3">Administración</Text>
                        
                        {/* Panel de Administración */}
                        <TouchableOpacity
                            className="bg-purple-50 rounded-xl p-4 mb-3 flex-row items-center justify-between border border-purple-200"
                            onPress={() => router.push('/admin')}
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-purple-500 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="shield-outline" size={22} color="#FFFFFF" />
                                </View>
                                <View>
                                    <Text className="font-semibold text-gray-800">Panel de Administración</Text>
                                    <Text className="text-xs text-gray-500">Acceso al dashboard de gestión</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                        
                    </View>
                )}

                {/* Separador */}
                {tieneAccesoAdmin && (
                    <View className="h-px bg-gray-200 my-2" />
                )}

                {/* Acciones de perfil */}
                {/* <TouchableOpacity
                    className="bg-gray-100 py-4 rounded-xl flex-row items-center justify-center mb-3"
                    onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
                >
                    <Ionicons name="settings-outline" size={22} color="#6B7280" />
                    <Text className="text-gray-700 font-semibold ml-2">Configuración</Text>
                </TouchableOpacity> */}

                {/* Cerrar Sesión */}
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