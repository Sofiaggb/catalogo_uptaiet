// app/(tabs)/libros/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { librosApi } from '@/services/api/endpoints/libros';
import { materiasApi } from '@/services/api/endpoints/materias';
import type { Libros, Materia } from '@/services/api/types';

export default function LibrosListScreen() {
    const [libros, setLibros] = useState<Libros[]>([]);
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Filtros (usar solo materiasSeleccionadas, no filtroMateria separado)
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<number[]>([]);
    const [modalMateriasVisible, setModalMateriasVisible] = useState(false);

    // Paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    // Contar filtros activos
    const totalFiltrosActivos = materiasSeleccionadas.length + (searchText ? 1 : 0);

    // ============================================
    // FUNCIONES
    // ============================================

    const cargarMaterias = async () => {
        const data = await materiasApi.getAll();
        setMaterias(data);
    };

    const cargarLibros = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const data = await librosApi.getAll({
                buscar: searchText || undefined,
                id_materia: materiasSeleccionadas.length > 0 ? materiasSeleccionadas.join(',') : undefined,
                page: isLoadMore ? page : 1,
                limit: 10
            });

            const librosData = Array.isArray(data?.data) ? data.data : [];

            if (data?.pagination) {
                setTotalPages(data.pagination.pages);
            }

            if (isLoadMore) {
                setLibros(prev => [...prev, ...librosData]);
                setLoadingMore(false);
            } else {
                setLibros(librosData);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error cargando libros:', error);
            if (isLoadMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
            setLibros([]);
        }
    };

    const loadMore = () => {
        if (page < totalPages && !loadingMore) {
            setPage(prev => prev + 1);
            cargarLibros(true);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        cargarLibros(false);
        setRefreshing(false);
    };

    const limpiarFiltros = () => {
        setMateriasSeleccionadas([]);
        setSearchText('');
        setPage(1);
        cargarLibros(false);
    };

    const toggleMateria = (id: number) => {
        if (materiasSeleccionadas.includes(id)) {
            setMateriasSeleccionadas(materiasSeleccionadas.filter(m => m !== id));
        } else {
            setMateriasSeleccionadas([...materiasSeleccionadas, id]);
        }
        setPage(1);
    };

    const aplicarFiltros = () => {
        setModalMateriasVisible(false);
        setPage(1);
        cargarLibros(false);
    };

    // Cargar datos iniciales
    useFocusEffect(
        useCallback(() => {
            cargarMaterias();
            cargarLibros(false);
        }, [])
    );

    // Renderizar item de libro
    const renderLibroItem = ({ item }: { item: Libros }) => (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mx-5 my-2 border border-gray-200 shadow-sm"
            onPress={() => router.push(`/libros/${item.id_libro}`)}
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="text-black font-bold text-lg">{item.titulo}</Text>

                    <View className="flex-row flex-wrap mt-2">
                        {item.autor && (
                            <View className="flex-row items-center bg-blue-100 rounded-full px-3 py-1 mr-2 mb-1">
                                <Ionicons name="person-outline" size={10} color="#2563EB" />
                                <Text className="text-blue-700 text-xs ml-1">{item.autor}</Text>
                            </View>
                        )}

                        {item.materia && (
                            <View className="flex-row items-center bg-green-100 rounded-full px-3 py-1 mr-2 mb-1">
                                <Ionicons name="book-outline" size={10} color="#059669" />
                                <Text className="text-green-700 text-xs ml-1">{item.materia}</Text>
                            </View>
                        )}

                        {item.editorial && (
                            <View className="flex-row items-center bg-purple-100 rounded-full px-3 py-1 mr-2 mb-1">
                                <Ionicons name="business-outline" size={10} color="#9333EA" />
                                <Text className="text-purple-700 text-xs ml-1">{item.editorial}</Text>
                            </View>
                        )}

                        {item.year && (
                            <View className="flex-row items-center bg-yellow-100 rounded-full px-3 py-1 mb-1">
                                <Ionicons name="calendar-outline" size={10} color="#D97706" />
                                <Text className="text-yellow-700 text-xs ml-1">{item.year}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    if (loading && libros.length === 0) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-4">Cargando libros...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-cyan-100 pt-2 pb-4 px-5">
                <Text className="text-sm">Libros y materiales de apoyo</Text>
                {!loading && libros.length > 0 && (
                    <Text className="text-xs mt-1 text-gray-600">
                        {libros.length} libro{libros.length !== 1 ? 's' : ''}
                    </Text>
                )}
            </View>

            {/* Buscador */}
            <View className="px-5 py-3">
                <View className="flex-row items-center bg-gray-100 rounded-xl">
                    <Ionicons name="search-outline" size={20} color="#9CA3AF" className="ml-3" />
                    <TextInput
                        className="flex-1 p-3 text-base"
                        placeholder="Buscar por título o autor..."
                        value={searchText}
                        onChangeText={(text) => {
                            setSearchText(text);
                            setPage(1);
                            cargarLibros(false);
                        }}
                        placeholderTextColor="#999"
                    />
                    {searchText !== '' && (
                        <TouchableOpacity onPress={() => {
                            setSearchText('');
                            setPage(1);
                            cargarLibros(false);
                        }} className="pr-3">
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Badges de filtros activos */}
            {totalFiltrosActivos > 0 && (
                <View className="px-5 pb-3 mt-2">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {/* Badges de materias */}
                        {materiasSeleccionadas.map(id => {
                            const materia = materias.find(m => m.id_materia === id);
                            return (
                                <TouchableOpacity
                                    key={`m-${id}`}
                                    className="flex-row items-center bg-yellow-100 rounded-full px-3 py-1.5 mr-2 mb-2"
                                    onPress={() => {
                                        toggleMateria(id);
                                        cargarLibros(false);
                                    }}
                                >
                                    <Text className="text-black text-sm">{materia?.nombre}</Text>
                                    <Ionicons name="close-circle" size={16} color="#000000" className="ml-1" />
                                </TouchableOpacity>
                            );
                        })}

                        {/* Botón limpiar todo */}
                        <TouchableOpacity
                            className="flex-row items-center bg-gray-200 rounded-full px-3 py-1.5 mr-2 mb-2"
                            onPress={limpiarFiltros}
                        >
                            <Ionicons name="refresh-outline" size={14} color="#EF4444" />
                            <Text className="text-red-500 text-sm ml-1">Limpiar todo</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            )}

            {/* Barra de filtros */}
            <View className="px-5 pb-3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        className={`flex-row items-center rounded-full px-4 py-2 mr-2 ${materiasSeleccionadas.length > 0 ? 'bg-yellow-500' : 'bg-gray-200'
                            }`}
                        onPress={() => setModalMateriasVisible(true)}
                    >
                        <Ionicons
                            name="book-outline"
                            size={16}
                            color={materiasSeleccionadas.length > 0 ? '#000000' : '#6B7280'}
                        />
                        <Text className={`ml-1 ${materiasSeleccionadas.length > 0 ? 'text-black font-bold' : 'text-gray-700'}`}>
                            Materias {materiasSeleccionadas.length > 0 && `(${materiasSeleccionadas.length})`}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={materiasSeleccionadas.length > 0 ? '#000000' : '#6B7280'} />
                    </TouchableOpacity>

                    {totalFiltrosActivos > 0 && (
                        <TouchableOpacity
                            className="flex-row items-center rounded-full px-4 py-2 bg-red-100"
                            onPress={limpiarFiltros}
                        >
                            <Ionicons name="refresh-outline" size={16} color="#EF4444" />
                            <Text className="ml-1 text-red-500">Limpiar</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>

            {/* Lista */}
            <FlatList
                data={libros}
                keyExtractor={(item) => item.id_libro.toString()}
                renderItem={renderLibroItem}
                onRefresh={onRefresh}
                refreshing={refreshing}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={() => (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="book-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-center mt-4">
                            {searchText || materiasSeleccionadas.length > 0
                                ? 'No se encontraron libros con esos filtros'
                                : 'No hay libros disponibles'}
                        </Text>
                    </View>
                )}
                ListFooterComponent={() =>
                    loadingMore && (
                        <ActivityIndicator size="small" color="#3B82F6" className="py-4" />
                    )
                }
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* Botón flotante */}
            <Pressable
                className="absolute bottom-6 right-6 bg-sky-400 rounded-full p-4 shadow-lg"
                onPress={() => router.push('/libros/create')}
            >
                <Ionicons name="add" size={28} color="#000000" />
            </Pressable>

            {/* Modal de selección de materias */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalMateriasVisible}
                onRequestClose={() => setModalMateriasVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl max-h-96">
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                            <Text className="text-lg font-bold">Seleccionar Materias</Text>
                            <TouchableOpacity onPress={() => setModalMateriasVisible(false)}>
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-4">
                            {materias.map(materia => (
                                <TouchableOpacity
                                    key={materia.id_materia}
                                    className={`flex-row items-center justify-between p-3 mb-2 rounded-lg ${materiasSeleccionadas.includes(materia.id_materia) ? 'bg-yellow-100' : 'bg-gray-50'
                                        }`}
                                    onPress={() => toggleMateria(materia.id_materia)}
                                >
                                    <Text className="text-base">{materia.nombre}</Text>
                                    {materiasSeleccionadas.includes(materia.id_materia) && (
                                        <Ionicons name="checkmark-circle" size={22} color="#000000" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View className="flex-row gap-4 p-4 border-t border-gray-200">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 py-3 rounded-xl"
                                onPress={() => {
                                    setMateriasSeleccionadas([]);
                                    setModalMateriasVisible(false);
                                    setPage(1);
                                    cargarLibros(false);
                                }}
                            >
                                <Text className="text-center text-gray-700">Limpiar todo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-yellow-500 py-3 rounded-xl"
                                onPress={aplicarFiltros}
                            >
                                <Text className="text-center text-black font-bold">
                                    Aplicar ({materiasSeleccionadas.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}