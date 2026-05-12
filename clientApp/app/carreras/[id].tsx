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
            `¿Estás seguro de eliminar "${carrera?.nombre}"?\n\nEsta acción eliminará también todas las tesis asociadas a esta carrera.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await carrerasApi.delete(Number(id));
                        if (success) {
                            Alert.alert('Éxito', 'Carrera eliminada correctamente', [
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
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text className="text-gray-500 mt-4">Cargando detalles...</Text>
            </View>
        );
    }

    if (!carrera) {
        return (
            <View className="flex-1 bg-white justify-center items-center p-5">
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className="text-red-500 text-center mt-4 text-lg">Carrera no encontrada</Text>
                <TouchableOpacity
                    className="mt-6 bg-cyan-500 px-6 py-3 rounded-xl"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-bold">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Determinar colores según el tipo de carrera
    const getTipoCarreraColor = (tipo: string) => {
        switch (tipo?.toLowerCase()) {
            case 'pregrado': return { bg: '#EFF6FF', text: '#2563EB', icon: 'school-outline' };
            case 'especialización': return { bg: '#FEF3C7', text: '#D97706', icon: 'medal-outline' };
            case 'maestría': return { bg: '#ECFDF5', text: '#059669', icon: 'ribbon-outline' };
            case 'doctorado': return { bg: '#F3E8FF', text: '#7E22CE', icon: 'flask-outline' };
            default: return { bg: '#F3F4F6', text: '#4B5563', icon: 'school-outline' };
        }
    };

    const tipoColor = getTipoCarreraColor(carrera.tipo_carrera || '');

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header con gradiente (simulado) */}
            <View className=" pt-16 pb-8 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back-outline" size={28} color="#0ea5e9" />
                    </TouchableOpacity>
                    <Text className="text-cyan-600 text-2xl font-semibold flex-1">Detalle de Carrera</Text>
                </View>
            </View>

            {/* Contenido principal */}
            <View className="p-5 -mt-6">
                {/* Tarjeta principal */}
                <View >
                    {/* Nombre de la carrera */}
                    <Text className="text-3xl font-bold text-gray-800">{carrera.nombre}</Text>
                    
                    {/* Tipo de carrera con badge */}
                    <View className="mt-4 flex-row items-center">
                        <View className={`rounded-full px-4 py-2 flex-row items-center`} style={{ backgroundColor: tipoColor.bg }}>
                            <Ionicons name={tipoColor.icon as any} size={18} color={tipoColor.text} />
                            <Text className="ml-2 font-semibold" style={{ color: tipoColor.text }}>
                                {carrera.tipo_carrera || 'No especificado'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Sección de tipo de trabajo (si existe) */}
                {carrera.tipo_trabajo && (
                    <View className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="briefcase-outline" size={22} color="#2563EB" />
                            <Text className="text-lg font-semibold text-gray-800 ml-2">Modalidad de Trabajo de Grado</Text>
                        </View>
                        
                        <View className="bg-white rounded-xl p-4 border border-blue-100">
                            <Text className="text-blue-700 font-bold text-lg">{carrera.tipo_trabajo}</Text>
                            <Text className="text-gray-500 text-sm mt-1">
                                Esta es la modalidad de titulación para esta carrera
                            </Text>
                        </View>
                    </View>
                )}

                  {/* Sección de descripción */}
                {carrera.descripcion ? (
                    <View className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="document-text-outline" size={22} color="#0ea5e9" />
                            <Text className="text-lg font-semibold text-gray-800 ml-2">Descripción</Text>
                        </View>
                        <Text className="text-gray-600 leading-6">{carrera.descripcion}</Text>
                    </View>
                ) : (
                    <View className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-100 items-center">
                        <Ionicons name="document-text-outline" size={32} color="#9CA3AF" />
                        <Text className="text-gray-400 text-center mt-2">Sin descripción disponible</Text>
                    </View>
                )}

                {/* Acciones */}
                <View className="flex-row gap-4 mt-8 mb-10">
                    <TouchableOpacity
                        className="flex-1 bg-yellow-500 py-4 rounded-xl flex-row items-center justify-center"
                        onPress={() => router.push(`/carreras/edit/${carrera.id_carrera}`)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create-outline" size={22} color="#000000" />
                        <Text className="text-black font-bold text-base ml-2">Editar Carrera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-red-500 py-4 rounded-xl flex-row items-center justify-center"
                        onPress={handleDelete}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
                        <Text className="text-white font-bold text-base ml-2">Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}