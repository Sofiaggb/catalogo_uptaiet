// app/(tabs)/tesis/index.tsx
import { carrerasApi } from '@/services/api/endpoints/carreras';
import { tesisApi } from '@/services/api/endpoints/tesis';
import { Carrera, Tesis } from '@/services/api/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function TesisListScreen() {
    const router = useRouter();
    const [tesis, setTesis] = useState<Tesis[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [carreras, setCarreras] = useState<Carrera[]>([]);

    const [carrerasSeleccionadas, setCarrerasSeleccionadas] = useState<number[]>([]);
    const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
    const [aniosSeleccionados, setAniosSeleccionados] = useState<number[]>([]);

    // Estado de los modales
    const [modalCarrerasVisible, setModalCarrerasVisible] = useState(false);
    const [modalAniosVisible, setModalAniosVisible] = useState(false);

    // Búsqueda por texto
    const [buscar, setBuscar] = useState('');

    // Paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResultados, setTotalResultados] = useState(0);

    // ============================================
    // EFECTOS
    // ============================================

    useEffect(() => {
        cargarCarreras();
        cargarAniosDisponibles();
    }, []);

    useEffect(() => {
        cargarTesis();
    }, [page, carrerasSeleccionadas, aniosSeleccionados, buscar]);

    // ============================================
    // FUNCIONES
    // ============================================

    const cargarCarreras = async () => {
        const data = await carrerasApi.getAll();
        setCarreras(data);
    };

    const cargarAniosDisponibles = async () => {
        const years = await tesisApi.getAniosDisponibles();
      //  console.log('reas>>>>>> ', years)
        setAniosDisponibles(years);
    };

    const cargarTesis = async () => {
        setLoading(true);

        // Construir parámetros
        const params: any = {
            page,
            limit: 10
        };

        // Agregar filtros (si hay seleccionados)
        if (carrerasSeleccionadas.length > 0) {
            params.id_carrera = carrerasSeleccionadas.join(','); // Enviar como string separado por comas
        }

        if (aniosSeleccionados.length > 0) {
            params.anio = aniosSeleccionados.join(',');
        }

        if (buscar.trim()) {
            params.buscar = buscar;
        }

        const result = await tesisApi.listar(params);
        console.log('resultado tesis >>>> ',result)
        if (result.success) {
            if (page === 1) {
                setTesis(result.data);
            } else {
                setTesis(prev => [...prev, ...result.data]);
            }
            setTotalPages(result.pagination.pages);
            setTotalResultados(result.pagination.total);
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

    // Limpiar todos los filtros
    const limpiarFiltros = () => {
        setCarrerasSeleccionadas([]);
        setAniosSeleccionados([]);
        setBuscar('');
        setPage(1);
    };

    // Toggle selección de carrera
    const toggleCarrera = (id: number) => {
        if (carrerasSeleccionadas.includes(id)) {
            setCarrerasSeleccionadas(carrerasSeleccionadas.filter(c => c !== id));
        } else {
            setCarrerasSeleccionadas([...carrerasSeleccionadas, id]);
        }
        setPage(1); // Resetear página
    };

    // Toggle selección de año
    const toggleAnio = (anio: number) => {
        if (aniosSeleccionados.includes(anio)) {
            setAniosSeleccionados(aniosSeleccionados.filter(a => a !== anio));
        } else {
            setAniosSeleccionados([...aniosSeleccionados, anio]);
        }
        setPage(1);
    };

    // Renderizar item de tesis
    const renderTesisItem = ({ item }: { item: Tesis }) => (
        <TouchableOpacity
            className="bg-gray-50 rounded-xl p-4 mx-5 my-2 border border-gray-200"
            onPress={() => router.push(`/tesis/${item.id_tesis}`)}
        >
            <Text className="text-black font-bold text-lg">{item.titulo}</Text>
            <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
                { item.resumen_corto}
            </Text>
            <View className="flex-row flex-wrap mt-2">
                <View className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-1">
                    <Text className="text-xs text-gray-700">{item.nombre_carrera}</Text>
                </View>
                {item.promedio_nota && (
                    <View className="bg-yellow-400 rounded-full px-3 py-1">
                        <Text className="text-xs text-black font-bold">
                            <Ionicons name='star' color='#FFFFFF' />
                            {item.promedio_nota}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    // Contar filtros activos
    const totalFiltrosActivos = carrerasSeleccionadas.length + aniosSeleccionados.length + (buscar ? 1 : 0);

    if (loading && page === 1 && tesis.length === 0) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#FFD700" />
                <Text className="text-gray-500 mt-4">Cargando proyectos...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* ==================== HEADER ==================== */}
            <View className="bg-cyan-100 pt-2 pb-4 px-5">
                <Text className=" text-sm">Explora todos los trabajos de investigación</Text>

                {/* Contador de resultados */}
                {!loading && totalResultados > 0 && (
                    <Text className=" text-xs mt-2">
                        {totalResultados} resultado{totalResultados !== 1 ? 's' : ''}
                    </Text>
                )}
            </View>

            {/* ==================== BARRA DE BÚSQUEDA ==================== */}
            <View className="px-5 py-3">
                <View className="flex-row items-center bg-gray-100 rounded-xl">
                    <Ionicons name="search-outline" size={20} color="#9CA3AF" className="ml-3" />
                    <TextInput
                        className="flex-1 p-3 text-base"
                        placeholder="Buscar por título o resumen..."
                        value={buscar}
                        onChangeText={(text) => {
                            setBuscar(text);
                            setPage(1);
                        }}
                        placeholderTextColor="#999"
                    />
                    {buscar !== '' && (
                        <TouchableOpacity onPress={() => setBuscar('')} className="pr-3">
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Badges de filtros activos */}
            {totalFiltrosActivos > 0 && (
                <View className="px-5 pb-3 mt-2">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="flex-row flex-wrap"
                        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}
                    >
                        {/* Badges de carreras */}
                        {carrerasSeleccionadas.map(id => {
                            const carrera = carreras.find(c => c.id_carrera === id);
                            return (
                                <TouchableOpacity
                                    key={`c-${id}`}
                                    className="flex-row items-center bg-yellow-100 rounded-full px-3 py-1.5 mr-2 mb-2"
                                    onPress={() => toggleCarrera(id)}
                                >
                                    <Text className="text-black text-sm">{carrera?.nombre}</Text>
                                    <Ionicons name="close-circle" size={16} color="#000000" className="ml-1" />
                                </TouchableOpacity>
                            );
                        })}

                        {/* Badges de años */}
                        {aniosSeleccionados.map(anio => (
                            <TouchableOpacity
                                key={`a-${anio}`}
                                className="flex-row items-center bg-yellow-100 rounded-full px-3 py-1.5 mr-2 mb-2"
                                onPress={() => toggleAnio(anio)}
                            >
                                <Text className="text-black text-sm">{anio}</Text>
                                <Ionicons name="close-circle" size={16} color="#000000" className="ml-1" />
                            </TouchableOpacity>
                        ))}

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

            {/* ==================== FILTROS ==================== */}
            <View className="px-5 pb-3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {/* Botón filtro carreras */}
                    <TouchableOpacity
                        className={`flex-row items-center rounded-full px-4 py-2 mr-2 ${carrerasSeleccionadas.length > 0 ? 'bg-yellow-500' : 'bg-gray-200'
                            }`}
                        onPress={() => setModalCarrerasVisible(true)}
                    >
                        <Ionicons
                            name="school-outline"
                            size={16}
                            color={carrerasSeleccionadas.length > 0 ? '#000000' : '#6B7280'}
                        />
                        <Text className={`ml-1 ${carrerasSeleccionadas.length > 0 ? 'text-black font-bold' : 'text-gray-700'}`}>
                            Carreras {carrerasSeleccionadas.length > 0 && `(${carrerasSeleccionadas.length})`}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={14}
                            color={carrerasSeleccionadas.length > 0 ? '#000000' : '#6B7280'}
                        />
                    </TouchableOpacity>

                    {/* Botón filtro años */}
                    <TouchableOpacity
                        className={`flex-row items-center rounded-full px-4 py-2 mr-2 ${aniosSeleccionados.length > 0 ? 'bg-yellow-500' : 'bg-gray-200'
                            }`}
                        onPress={() => setModalAniosVisible(true)}
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color={aniosSeleccionados.length > 0 ? '#000000' : '#6B7280'}
                        />
                        <Text className={`ml-1 ${aniosSeleccionados.length > 0 ? 'text-black font-bold' : 'text-gray-700'}`}>
                            Años {aniosSeleccionados.length > 0 && `(${aniosSeleccionados.length})`}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={14}
                            color={aniosSeleccionados.length > 0 ? '#000000' : '#6B7280'}
                        />
                    </TouchableOpacity>

                    {/* Botón limpiar filtros (si hay filtros activos) */}
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

            {/* ==================== LISTA DE PROYECTOS ==================== */}
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
                        <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-center mt-4">No hay tesis disponibles</Text>
                        <Text className="text-gray-400 text-center text-sm mt-2">
                            Prueba con otros filtros
                        </Text>
                    </View>
                )}
                ListFooterComponent={() =>
                    loading && page > 1 ? (
                        <ActivityIndicator size="small" color="#FFD700" className="py-4" />
                    ) : null
                }
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* ==================== MODAL SELECCIÓN DE CARRERAS ==================== */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalCarrerasVisible}
                onRequestClose={() => setModalCarrerasVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl max-h-96">
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                            <Text className="text-lg font-bold">Seleccionar Carreras</Text>
                            <TouchableOpacity onPress={() => setModalCarrerasVisible(false)}>
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-4">
                            {carreras.map(carrera => (
                                <TouchableOpacity
                                    key={carrera.id_carrera}
                                    className={`flex-row items-center justify-between p-3 mb-2 rounded-lg ${carrerasSeleccionadas.includes(carrera.id_carrera) ? 'bg-yellow-100' : 'bg-gray-50'
                                        }`}
                                    onPress={() => toggleCarrera(carrera.id_carrera)}
                                >
                                    <Text className="text-base">{carrera.nombre}</Text>
                                    {carrerasSeleccionadas.includes(carrera.id_carrera) && (
                                        <Ionicons name="checkmark-circle" size={22} color="#000000" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View className="flex-row gap-4 p-4 border-t border-gray-200">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 py-3 rounded-xl"
                                onPress={() => setCarrerasSeleccionadas([])}
                            >
                                <Text className="text-center text-gray-700">Limpiar todo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-cyan-300 py-3 rounded-xl"
                                onPress={() => setModalCarrerasVisible(false)}
                            >
                                <Text className="text-center text-black font-bold">
                                    Aplicar ({carrerasSeleccionadas.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ==================== MODAL SELECCIÓN DE AÑOS ==================== */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalAniosVisible}
                onRequestClose={() => setModalAniosVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl max-h-96">
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                            <Text className="text-lg font-bold">Seleccionar Años</Text>
                            <TouchableOpacity onPress={() => setModalAniosVisible(false)}>
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-4">
                            {aniosDisponibles.map(anio => (
                                <TouchableOpacity
                                    key={anio}
                                    className={`flex-row items-center justify-between p-3 mb-2 rounded-lg ${aniosSeleccionados.includes(anio) ? 'bg-yellow-100' : 'bg-gray-50'
                                        }`}
                                    onPress={() => toggleAnio(anio)}
                                >
                                    <Text className="text-base">{anio}</Text>
                                    {aniosSeleccionados.includes(anio) && (
                                        <Ionicons name="checkmark-circle" size={22} color="#000000" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View className="flex-row gap-4 p-4 border-t border-gray-200">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 py-3 rounded-xl"
                                onPress={() => setAniosSeleccionados([])}
                            >
                                <Text className="text-center text-gray-700">Limpiar todo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-cyan-300 py-3 rounded-xl"
                                onPress={() => setModalAniosVisible(false)}
                            >
                                <Text className="text-center text-black font-bold">
                                    Aplicar ({aniosSeleccionados.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Botón Flotante para crear*/}
            <Pressable
                className="absolute bottom-6 right-6 bg-sky-400 rounded-full p-4 shadow-lg"
                onPress={() => router.push('/tesis/create')}
            >
                <Ionicons name="add" size={28} color="#000000" />
            </Pressable>
        </View>
    );
}