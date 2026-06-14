import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import { adminApi } from '@/services/api/endpoints/admin';
import { router } from 'expo-router';

interface EstadisticaTabla {
    tabla: string;
    total: number;
    inserts: number;
    updates: number;
    deletes: number;
    usuarios_distintos: number;
}

export default function EstadisticasScreen() {
    const [estadisticas, setEstadisticas] = useState<EstadisticaTabla[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalGeneral, setTotalGeneral] = useState(0);
    const [totalInserts, setTotalInserts] = useState(0);
    const [totalUpdates, setTotalUpdates] = useState(0);
    const [totalDeletes, setTotalDeletes] = useState(0);

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        setLoading(true);
        try {
            const result = await adminApi.obtenerEstadisticasAuditoria();
            if (result.success) {
                setEstadisticas(result.data);

                let totalGral = 0;
                let insertsGral = 0;
                let updatesGral = 0;
                let deletesGral = 0;

                result.data.forEach((stat: EstadisticaTabla) => {
                    totalGral += stat.total;
                    insertsGral += stat.inserts;
                    updatesGral += stat.updates;
                    deletesGral += stat.deletes;
                });

                setTotalGeneral(totalGral);
                setTotalInserts(insertsGral);
                setTotalUpdates(updatesGral);
                setTotalDeletes(deletesGral);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconForTabla = (tabla: string) => {
        switch (tabla) {
            case 'tesis': return 'document-text-outline';
            case 'usuario': return 'person-outline';
            case 'libro': return 'book-outline';
            default: return 'folder-outline';
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text className="text-gray-500 mt-4">Cargando estadísticas...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-cyan-600 pt-12 pb-4 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="w-10">
                        <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="">
                        <Text className="text-white text-2xl font-bold">Estadísticas</Text>
                        <Text className="text-white/80 text-sm">Métricas del sistema</Text>
                    </View>
                </View>
            </View>


            {/* Tarjetas de resumen */}
            <View className="px-5 mt-4">
                <View className="flex-row flex-wrap justify-between gap-3">
                    <View className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl p-4 w-[48%]">
                        <Text className="text-white/80 text-xs">Total eventos</Text>
                        <Text className="text-white text-2xl font-bold">{totalGeneral}</Text>
                        <Text className="text-white/60 text-xs mt-1">Últimos 30 días</Text>
                    </View>

                    <View className="bg-green-500 rounded-xl p-4 w-[48%]">
                        <Text className="text-white/80 text-xs">Creaciones</Text>
                        <Text className="text-white text-2xl font-bold">+{totalInserts}</Text>
                    </View>

                    <View className="bg-blue-500 rounded-xl p-4 w-[48%]">
                        <Text className="text-white/80 text-xs">Modificaciones</Text>
                        <Text className="text-white text-2xl font-bold">~{totalUpdates}</Text>
                    </View>

                    <View className="bg-red-500 rounded-xl p-4 w-[48%]">
                        <Text className="text-white/80 text-xs">Eliminaciones</Text>
                        <Text className="text-white text-2xl font-bold">-{totalDeletes}</Text>
                    </View>
                </View>
            </View>

            {/* Actividad por tabla */}
            <View className="bg-white rounded-xl border border-gray-200 mx-5 mt-6">
                <View className="p-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800">Actividad por tabla</Text>
                    <Text className="text-sm text-gray-500">Últimos 30 días</Text>
                </View>

                {estadisticas.map((stat, idx) => {
                    const maxTotal = Math.max(...estadisticas.map(s => s.total), 1);
                    const porcentaje = (stat.total / maxTotal) * 100;

                    return (
                        <View key={idx} className="p-4 border-b border-gray-100">
                            <View className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name={getIconForTabla(stat.tabla)} size={20} color="#6B7280" />
                                    <Text className="font-medium text-gray-700">{stat.tabla}</Text>
                                </View>
                                <Text className="font-bold text-gray-800">{stat.total}</Text>
                            </View>

                            <View className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <View
                                    className="bg-cyan-500 h-2 rounded-full"
                                    style={{ width: `${porcentaje}%` }}
                                />
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="text-xs text-green-600">+{stat.inserts}</Text>
                                <Text className="text-xs text-blue-600">~{stat.updates}</Text>
                                <Text className="text-xs text-red-600">-{stat.deletes}</Text>
                                <Text className="text-xs text-gray-500">👥 {stat.usuarios_distintos}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Distribución de acciones */}
            <View className="bg-white rounded-xl border border-gray-200 mx-5 mt-6 p-4">
                <Text className="text-md font-bold text-gray-800 mb-4">Distribución de acciones</Text>

                <View className="mb-3">
                    <View className="flex-row justify-between text-sm mb-1">
                        <Text>Creaciones</Text>
                        <Text className="text-green-600">{Math.round((totalInserts / totalGeneral) * 100)}%</Text>
                    </View>
                    <View className="w-full bg-gray-200 rounded-full h-2">
                        <View
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(totalInserts / totalGeneral) * 100}%` }}
                        />
                    </View>
                </View>

                <View className="mb-3">
                    <View className="flex-row justify-between text-sm mb-1">
                        <Text>Modificaciones</Text>
                        <Text className="text-blue-600">{Math.round((totalUpdates / totalGeneral) * 100)}%</Text>
                    </View>
                    <View className="w-full bg-gray-200 rounded-full h-2">
                        <View
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(totalUpdates / totalGeneral) * 100}%` }}
                        />
                    </View>
                </View>

                <View>
                    <View className="flex-row justify-between text-sm mb-1">
                        <Text>Eliminaciones</Text>
                        <Text className="text-red-600">{Math.round((totalDeletes / totalGeneral) * 100)}%</Text>
                    </View>
                    <View className="w-full bg-gray-200 rounded-full h-2">
                        <View
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(totalDeletes / totalGeneral) * 100}%` }}
                        />
                    </View>
                </View>
            </View>

            {/* Resumen ejecutivo */}
            <View className="bg-white rounded-xl border border-gray-200 mx-5 mt-6 mb-10 p-4">
                <Text className="text-md font-bold text-gray-800 mb-4">Resumen ejecutivo</Text>
                <Text className="text-sm text-gray-600 mb-3">
                    En los últimos 30 días se han registrado <Text className="text-cyan-600 font-bold">{totalGeneral}</Text> eventos
                    en el sistema.
                </Text>
                <View className="bg-gray-50 rounded-lg p-3">
                    <Text className="text-xs text-gray-500 mb-2">
                        📊 Tabla más activa: <Text className="font-bold">{estadisticas[0]?.tabla}</Text>
                        ({estadisticas[0]?.total} cambios)
                    </Text>
                    <Text className="text-xs text-gray-500">
                        👥 Usuarios participantes: <Text className="font-bold">
                            {estadisticas.reduce((acc, s) => acc + (s.usuarios_distintos || 0), 0)}
                        </Text>
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}