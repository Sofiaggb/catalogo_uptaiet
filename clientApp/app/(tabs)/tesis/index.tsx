// app/(tabs)/tesis/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { getCarreras, listarTesis, type Carrera, type Tesis } from '../../../services/api';

export default function TesisListScreen() {
    const router = useRouter();
    const [tesis, setTesis] = useState<Tesis[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    
    // Filtros
    const [filtroCarrera, setFiltroCarrera] = useState<number | null>(null);
    const [buscar, setBuscar] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        cargarCarreras();
    }, []);

    useEffect(() => {
        cargarTesis();
    }, [page, filtroCarrera, buscar]);

    const cargarCarreras = async () => {
        const data = await getCarreras();
        setCarreras(data);
    };

    const cargarTesis = async () => {
        setLoading(true);
        const result = await listarTesis({
            id_carrera: filtroCarrera || undefined,
            buscar: buscar || undefined,
            page,
            limit: 10
        });
        
        if (result.success) {
            if (page === 1) {
                setTesis(result.data);
            } else {
                setTesis(prev => [...prev, ...result.data]);
            }
            setTotalPages(result.pagination.pages);
        }
        setLoading(false);
        setRefreshing(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        cargarTesis();
    };

    const loadMore = () => {
        if (page < totalPages && !loading) {
            setPage(prev => prev + 1);
        }
    };

    const renderTesisItem = ({ item }: { item: Tesis }) => (
        <TouchableOpacity
            className="bg-gray-50 rounded-xl p-4 mx-5 my-2 border border-gray-200"
            onPress={() => router.push(`/tesis/${item.id_tesis}`)}
        >
            <Text className="text-black font-bold text-lg">{item.titulo}</Text>
            <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
                {item.resumen_corto || item.resumen}
            </Text>
            <View className="flex-row mt-2">
                <View className="bg-gray-200 rounded-full px-3 py-1 mr-2">
                    <Text className="text-xs text-gray-700">{item.nombre_carrera}</Text>
                </View>
                {item.promedio_nota && (
                    <View className="bg-yellow-500 rounded-full px-3 py-1">
                        <Text className="text-xs text-black font-bold">⭐ {item.promedio_nota}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    // Si está cargando por primera vez
    if (loading && page === 1 && tesis.length === 0) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#FFD700" />
                <Text className="text-gray-500 mt-4">Cargando tesis...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-black  pb-4 px-5">
                <Text className="text-white text-center text-sm">Explora todos los trabajos de investigación</Text>
            </View>

            {/* Buscador */}
            <View className="px-5 py-3">
                <TextInput
                    className="bg-gray-100 rounded-xl p-3 text-base"
                    placeholder="🔍 Buscar tesis..."
                    value={buscar}
                    onChangeText={(text) => {
                        setBuscar(text);
                        setPage(1);
                    }}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Filtros - ScrollView horizontal para las categorías */}
            <ScrollView 
                horizontal 
                className="px-5 pb-3" 
                showsHorizontalScrollIndicator={false}
            >
                <TouchableOpacity
                    className={`rounded-full px-4 py-2 mr-2 ${filtroCarrera === null ? 'bg-yellow-500' : 'bg-gray-200'}`}
                    onPress={() => {
                        setFiltroCarrera(null);
                        setPage(1);
                    }}
                >
                    <Text className={filtroCarrera === null ? 'text-black font-bold' : 'text-gray-700'}>
                        Todas
                    </Text>
                </TouchableOpacity>
                {carreras.map(carrera => (
                    <TouchableOpacity
                        key={carrera.id_carrera}
                        className={`rounded-full px-4 py-2 mr-2 ${filtroCarrera === carrera.id_carrera ? 'bg-yellow-500' : 'bg-gray-200'}`}
                        onPress={() => {
                            setFiltroCarrera(carrera.id_carrera);
                            setPage(1);
                        }}
                    >
                        <Text className={filtroCarrera === carrera.id_carrera ? 'text-black font-bold' : 'text-gray-700'}>
                            {carrera.nombre}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Lista principal */}
            <FlatList
                data={tesis}
                keyExtractor={(item) => item.id_tesis.toString()}
                renderItem={renderTesisItem}
                onRefresh={onRefresh}
                refreshing={refreshing}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={() => (
                    <View className="flex-1 items-center justify-center py-20">
                        <Text className="text-gray-500 text-center">No hay tesis disponibles</Text>
                    </View>
                )}
                ListFooterComponent={() => 
                    loading && page > 1 ? (
                        <ActivityIndicator size="small" color="#FFD700" className="py-4" />
                    ) : null
                }
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* Botón Flotante (FAB) */}
            <Pressable
                className="absolute bottom-6 right-6 bg-yellow-500 rounded-full p-4 shadow-lg"
                onPress={() => router.push('/tesis/create')}
            >
                <Ionicons name="add" size={28} color="#000000" />
            </Pressable>
        </View>
    );
}