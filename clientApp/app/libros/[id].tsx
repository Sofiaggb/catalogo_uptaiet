// app/(tabs)/libros/[id].tsx
import { STATIC_URL } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';
import { librosApi } from '@/services/api/endpoints/libros';
import { Libros } from '@/services/api/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function LibroDetailScreen() {
    const { isAuthenticated, hasRole } = useAuth();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [libro, setLibro] = useState<Libros | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Recargar cada vez que la pantalla recibe foco
    useFocusEffect(
        useCallback(() => {
            cargarLibro();
        }, [id])
    );

    const cargarLibro = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await librosApi.getById(Number(id));
            if (response.success && response.data) {
                setLibro(response.data);
            } else {
                setError(response.message || 'No se pudo cargar el libro');
            }
        } catch (error) {
            console.error('Error cargando libro:', error);
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const abrirDocumento = async () => {
        if (libro?.url_documento) {
            const url = `${STATIC_URL}${libro.url_documento}`;

            console.log('STATIC_URL:', STATIC_URL);
            console.log('libro.url_documento:', libro.url_documento);
            console.log('URL completa:', url);

            try {
                const checkResponse = await fetch(url, { method: 'HEAD' });
                console.log('Estado del archivo:', checkResponse.status);

                if (checkResponse.ok) {
                    await Linking.openURL(url);
                } else {
                    Alert.alert('Error', `No se pudo encontrar el documento (Status: ${checkResponse.status})`);
                }
            } catch (error) {
                console.error('Error abriendo documento:', error);
                Alert.alert('Error', 'No se pudo abrir el documento');
            }
        } else {
            Alert.alert('Información', 'No hay documento disponible');
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#FFD700" />
                <Text className="text-gray-500 mt-4">Cargando libro...</Text>
            </View>
        );
    }

    if (error || !libro) {
        return (
            <View className="flex-1 bg-white justify-center items-center p-5">
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className="text-red-500 text-center mt-4 text-lg">{error || 'Libro no encontrado'}</Text>
                <TouchableOpacity
                    className="mt-6 bg-cyan-500 px-6 py-3 rounded-xl"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-bold">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-16 pb-6 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back-outline" size={28} color="#0ea5e9" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-cyan-600 text-2xl font-bold">Detalles del Libro</Text>
                    </View>
                </View>
            </View>

            {/* Título */}
            <View className="p-5">
                <Text className="text-2xl font-bold text-black">{libro.titulo}</Text>

            </View>

            {/* Información del libro */}
            <View className="mx-5 mb-5 bg-gray-50 rounded-xl p-4 border border-gray-200">
                {/* Autor */}
                {libro.autor && (
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="person-outline" size={20} color="#6B7280" />
                        <Text className="text-gray-700 ml-2">
                            <Text className="font-semibold">Autor:</Text> {libro.autor}
                        </Text>
                    </View>
                )}

                {/* Editorial */}
                {libro.editorial && (
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="business-outline" size={20} color="#6B7280" />
                        <Text className="text-gray-700 ml-2">
                            <Text className="font-semibold">Editorial:</Text> {libro.editorial}
                        </Text>
                    </View>
                )}

                {/* Año */}
                {libro.year && (
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                        <Text className="text-gray-700 ml-2">
                            <Text className="font-semibold">Año de publicación:</Text> {libro.year}
                        </Text>
                    </View>
                )}

                {/* Materia */}
                {libro.materia && (
                    <View className="flex-row items-center">
                        <Ionicons name="school-outline" size={20} color="#6B7280" />
                        <Text className="text-gray-700 ml-2">
                            <Text className="font-semibold">Materia:</Text> {libro.materia}
                        </Text>
                    </View>
                )}
            </View>

            {/* Descripción */}
            {libro.descripcion && (
                <View className="px-5 mb-6">
                    <Text className="text-black text-lg font-bold mb-2">📖 Descripción</Text>
                    <Text className="text-gray-700 leading-6">{libro.descripcion}</Text>
                </View>
            )}

            {/* Fecha de creación */}
            {libro.fecha_creacion && (
                <Text className="text-gray-400 text-xs px-5 mb-4">
                    Agregado: {new Date(libro.fecha_creacion).toLocaleDateString()}
                </Text>
            )}

            {/* ==================== ACCIONES ==================== */}
            <View className="px-5 mb-5 gap-3">
                {/* Abrir documento */}
                <TouchableOpacity
                    className="bg-cyan-500 py-4 rounded-xl flex-row items-center justify-center"
                    onPress={abrirDocumento}
                >
                    <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
                    <Text className="text-white font-bold text-lg ml-2">
                        {libro.url_documento ? 'Abrir documento' : 'Documento no disponible'}
                    </Text>
                </TouchableOpacity>

                {/* Botones secundarios - en fila */}
                <View className="flex-row gap-3">
                    {/* Botón Editar */}
                     {isAuthenticated && (
                    <TouchableOpacity
                        onPress={() => router.push(`/libros/edit/${libro.id_libro}`)}
                        className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create-outline" size={24} color="#000000" />
                        <Text className="text-black ml-2">Editar</Text>
                    </TouchableOpacity>
                     )}
                    {/* Botón Compartir */}
                    <TouchableOpacity
                        className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
                        onPress={() => {
                            Alert.alert('Compartir', 'Función en desarrollo');
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="share-outline" size={20} color="#6B7280" />
                        <Text className="text-gray-600 font-semibold text-sm ml-2">Compartir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}