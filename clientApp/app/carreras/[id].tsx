// app/(tabs)/carreras/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { carrerasApi } from '@/services/api/endpoints/carreras';
import type { Carrera } from '@/services/api/types';

export default function CarreraDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [carrera, setCarrera] = useState<Carrera | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCarrera();
    }, [id]);

    const cargarCarrera = async () => {
        setLoading(true);
        const data = await carrerasApi.getById(Number(id));
        setCarrera(data);
        setLoading(false);
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar Carrera',
            `¿Estás seguro de eliminar "${carrera?.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await carrerasApi.delete(Number(id));
                        if (success) {
                            Alert.alert('Éxito', 'Carrera eliminada', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } else {
                            Alert.alert('Error', 'No se pudo eliminar la carrera');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-4">Cargando...</Text>
            </View>
        );
    }

    if (!carrera) {
        return (
            <View className="flex-1 bg-white justify-center items-center p-5">
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className="text-red-500 text-center mt-4 text-lg">Carrera no encontrada</Text>
                <TouchableOpacity
                    className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
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
            <View className="bg-black pt-12 pb-6 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back-outline" size={28} color="#FFD700" />
                    </TouchableOpacity>
                    <Text className="text-yellow-500 text-2xl font-bold flex-1">Detalle de Carrera</Text>
                </View>
            </View>

            {/* Contenido */}
            <View className="p-5">
                <Text className="text-3xl font-bold text-black">{carrera.nombre}</Text>

                {carrera.tipo_carrera && (
                    <View className="mt-3">
                        <View className="bg-blue-100 rounded-full px-3 py-1 self-start">
                            <Text className="text-blue-700 font-semibold">{carrera.tipo_carrera.nombre}</Text>
                        </View>
                    </View>
                )}

                {carrera.descripcion && (
                    <View className="mt-6">
                        <Text className="text-gray-700 leading-6">{carrera.descripcion}</Text>
                    </View>
                )}

                {carrera.fecha_creacion && (
                    <Text className="text-gray-400 text-xs mt-6">
                        Creada: {new Date(carrera.fecha_creacion).toLocaleDateString()}
                    </Text>
                )}

                {/* Botones de acción */}
                <View className="flex-row gap-3 mt-8">
                    <TouchableOpacity
                        className="flex-1 bg-yellow-500 py-3 rounded-xl flex-row items-center justify-center"
                        onPress={() => router.push(`/carreras/edit/${carrera.id_carrera}`)}
                    >
                        <Ionicons name="create-outline" size={20} color="#000000" />
                        <Text className="text-black font-bold ml-2">Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-red-500 py-3 rounded-xl flex-row items-center justify-center"
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                        <Text className="text-white font-bold ml-2">Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}