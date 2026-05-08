// app/carreras/index.tsx - VERSIÓN CON BOTÓN DE VOLVER
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { carrerasApi } from '@/services/api/endpoints/carreras';
import type { Carrera } from '@/services/api/types';

// Componente de tarjeta de carrera
const CarreraCard = ({ carrera, onPress }: { carrera: Carrera; onPress: () => void }) => (
    <TouchableOpacity
        className="bg-white rounded-xl p-4 mx-5 my-2 border border-gray-200 shadow-sm"
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View className="flex-row justify-between items-start">
            <View className="flex-1">
                <Text className=" font-bold text-lg">{carrera.nombre}</Text>
                {carrera.descripcion && (
                    <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                        {carrera.descripcion}
                    </Text>
                )}
                {carrera.tipo_carrera && (
                    <View className="mt-2">
                        <View className="bg-blue-100 self-start rounded-full px-3 py-1">
                            <Text className="text-blue-700 text-xs">{carrera.tipo_carrera.nombre}</Text>
                        </View>
                    </View>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
    </TouchableOpacity>
);

export default function CarrerasListScreen() {
    const router = useRouter();
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [filteredCarreras, setFilteredCarreras] = useState<Carrera[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        cargarCarreras();
    }, []);

    useEffect(() => {
        filtrarCarreras();
    }, [searchText, carreras]);

    const cargarCarreras = async () => {
        setLoading(true);
        const data = await carrerasApi.getAll();
        setCarreras(data);
        setFilteredCarreras(data);
        setLoading(false);
        setRefreshing(false);
    };

    const filtrarCarreras = () => {
        if (!searchText.trim()) {
            setFilteredCarreras(carreras);
            return;
        }
        const filtered = carreras.filter(c =>
            c.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
            c.descripcion?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredCarreras(filtered);
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarCarreras();
    };

    if (loading && carreras.length === 0) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-4">Cargando carreras...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* ==================== HEADER CON BOTÓN VOLVER ==================== */}
            <View className=" pt-16 pb-4 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="w-10">
                        <Ionicons name="arrow-back-outline" size={28} color="#06b6d4" />
                    </TouchableOpacity>

                    <View className="flex-1 flex-row items-center justify-center gap-2">
                        <Text className="text-cyan-600 text-xl font-bold">
                            Carreras
                        </Text>
                    </View>

                    <View className="w-10" />
                </View>
            </View>
            {/* Buscador */}
            <View className="px-5 py-3">
                <View className="flex-row items-center bg-gray-100 rounded-xl">
                    <Ionicons name="search-outline" size={20} color="#9CA3AF" className="ml-3" />
                    <TextInput
                        className="flex-1 p-3 text-base"
                        placeholder="Buscar carrera..."
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor="#999"
                    />
                    {searchText !== '' && (
                        <TouchableOpacity onPress={() => setSearchText('')} className="pr-3">
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Contador de resultados */}
            <View className="px-5 pb-2">
                <Text className="text-gray-500 text-sm">
                    {filteredCarreras.length} carrera{filteredCarreras.length !== 1 ? 's' : ''} encontrada
                    {filteredCarreras.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Lista */}
            <FlatList
                data={filteredCarreras}
                keyExtractor={(item) => item.id_carrera.toString()}
                renderItem={({ item }) => (
                    <CarreraCard
                        carrera={item}
                        onPress={() => router.push(`/carreras/${item.id_carrera}`)}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
                }
                ListEmptyComponent={() => (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="school-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-center mt-4">
                            {searchText ? 'No se encontraron carreras' : 'No hay carreras disponibles'}
                        </Text>
                        {searchText && (
                            <TouchableOpacity onPress={() => setSearchText('')}>
                                <Text className="text-blue-500 mt-2">Limpiar búsqueda</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* Botón flotante para crear */}
            <Pressable
                className="absolute bottom-6 right-6 bg-sky-400 rounded-full p-4 shadow-lg"
                onPress={() => router.push('/carreras/create')}
            >
                <Ionicons name="add" size={28} color="#00000" />
            </Pressable>
        </View>
    );
}