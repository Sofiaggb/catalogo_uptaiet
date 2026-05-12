// app/(tabs)/tesis/[id].tsx
import { STATIC_URL } from '@/config/env';
import { tesisApi } from '@/services/api/endpoints/tesis';
import { Tesis } from '@/services/api/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TesisDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [tesis, setTesis] = useState<Tesis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Recargar cada vez que la pantalla recibe foco
    useFocusEffect(
        useCallback(() => {
            cargarTesis();
        }, [id])
    );

    const cargarTesis = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await tesisApi.getById(Number(id));
            if (response.success && response.data) {
                setTesis(response.data);
                // console.log(response.data)
            } else {
                console.log(response)

                setError(response.message || 'No se pudo cargar la tesis');
            }
        } catch (error) {
            console.error('Error cargando tesis:', error);
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    // app/(tabs)/tesis/[id].tsx
    const abrirDocumento = async () => {
        if (tesis?.url_documento) {
            const url = `${STATIC_URL}${tesis.url_documento}`;

            console.log(' STATIC_URL:', STATIC_URL);
            console.log(' tesis.url_documento:', tesis.url_documento);
            console.log('URL completa:', url);

            try {
                // Primero verifica si el archivo existe (opcional)
                const checkResponse = await fetch(url, { method: 'HEAD' });
                console.log(' Estado del archivo:', checkResponse.status);

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
                <Text className="text-gray-500 mt-4">Cargando tesis...</Text>
            </View>
        );
    }

    if (error || !tesis) {
        return (
            <View className="flex-1 bg-white justify-center items-center p-5">
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className="text-red-500 text-center mt-4 text-lg">{error || 'Tesis no encontrada'}</Text>
                <TouchableOpacity
                    className="mt-6 bg-sky-600 px-6 py-3 rounded-xl"
                    onPress={() => router.back()}
                >
                    <Text className="text-sky-500 font-bold">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className=" pt-16 pb-6 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back-outline" size={28} color="#0ea5e9" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-cyan-600 text-2xl font-bold">Detalles del proyecto</Text>
                    </View>
                </View>
            </View>

            {/* Título */}
            <View className="p-5">
                <Text className="text-2xl font-bold text-black">{tesis.titulo}</Text>

                {/* Badges */}
                <View className="flex-row flex-wrap mt-3">
                    <View className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                        <Text className="text-gray-600 text-sm">{tesis.nombre_carrera}</Text>
                    </View>
                    <View className="bg-cyan-100 rounded-full px-3 py-1 mr-2 mb-2">
                        <Text className="text-cyan-800 text-sm">{tesis.anio_elaboracion}</Text>
                    </View>
                </View>
            </View>

            {/* Promedio */}
            {tesis.promedio_nota && (
                <View className="mx-5 mb-5 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-700">Calificación promedio</Text>
                        <View className="flex-row items-center">
                            <Ionicons name="star" size={24} color="#FFD700" />
                            <Text className="text-2xl font-bold text-black ml-1">{tesis.promedio_nota}</Text>
                            <Text className="text-gray-500 text-base">/20</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Resumen */}
            <View className="px-5 mb-6">
                <Text className="text-black text-lg font-bold mb-2"> Resumen</Text>
                <Text className="text-gray-700 leading-6">{tesis.resumen || 'Sin resumen disponible'}</Text>
            </View>

            {/* Estudiantes */}
            <View className="px-5 mb-6">
                <Text className="text-black text-lg font-bold mb-3">
                    Estudiantes ({tesis.estudiantes?.length || 0})
                </Text>
                {tesis.estudiantes?.map((estudiante, index) => (
                    <View key={estudiante.id_estudiante} className="bg-gray-50 rounded-xl p-3 mb-2 border border-gray-200">
                        <Text className="text-black font-semibold">{estudiante.nombre_completo}</Text>
                        <Text className="text-gray-500 text-sm mt-1">Cédula: {estudiante.cedula}</Text>
                        {estudiante.email && (
                            <Text className="text-gray-500 text-sm">Email: {estudiante.email}</Text>
                        )}
                    </View>
                ))}
            </View>

            {/* Evaluaciones */}
            <View className="px-5 mb-6">
                <Text className="text-black text-lg font-bold mb-3">
                    Evaluaciones ({tesis.evaluaciones?.length || 0})
                </Text>
                {tesis.evaluaciones?.map((evaluacion) => (
                    <View key={evaluacion.id_evaluacion} className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200">
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                                <Text className="text-black font-semibold">{evaluacion.jurado.titulo_profesional} {evaluacion.jurado.nombre_completo}</Text>
                                <Text className="text-gray-500 text-sm mt-1">Cédula: {evaluacion.jurado.cedula}</Text>
                            </View>
                            <View className="bg-yellow-100 border border-yellow-200 rounded-full px-3 py-1">
                                <Text className="text-black font-bold text-lg">{evaluacion.nota}</Text>
                            </View>
                        </View>
                        <Text className="text-gray-600 mt-3 text-sm">{'Observacion: ' + evaluacion.comentarios || 'Sin comentarios'}</Text>
                        <Text className="text-gray-400 text-xs mt-2">
                            Evaluado el: {new Date(evaluacion.fecha_evaluacion).toLocaleDateString()}
                        </Text>
                    </View>
                ))}
            </View>

            {/* ==================== ACCIONES ==================== */}
            <View className="px-5 mb-5 gap-3">
                {/* Descargar PDF */}
                <TouchableOpacity
                    className="bg-cyan-500 py-4 rounded-xl flex-row items-center justify-center"
                    onPress={abrirDocumento}
                >
                    <Ionicons name="download-outline" size={24} color="#FFFFFF" />
                    <Text className="text-white font-bold text-lg ml-2">
                        {tesis.url_documento ? 'Descargar PDF' : 'Documento no disponible'}
                    </Text>
                </TouchableOpacity>

                {/* Botones secundarios - en fila */}
                <View className="flex-row gap-3">
                    {/* Botón principal - Editar */}
                    <TouchableOpacity
                        onPress={() => router.push(`/tesis/edit/${tesis.id_tesis}`)}
                        className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create-outline" size={24} color="#000000" />
                        <Text className="text-black  ml-2">Editar</Text>
                    </TouchableOpacity>

                    {/* Compartir (opcional) */}
                    <TouchableOpacity
                        className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
                        onPress={() => {
                            // Función para compartir
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