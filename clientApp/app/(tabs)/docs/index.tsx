// app/(tabs)/recursos/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { documentosApi } from '@/services/api/endpoints/documentos';
import { materiasApi } from '@/services/api/endpoints/materias';
import type { Documento, Materia } from '@/services/api/types';

// ============================================
// COMPONENTE TARJETA DE DOCUMENTO
// ============================================
const DocumentoCard = ({ documento, onRefresh }: { documento: Documento; onRefresh: () => void }) => {
    
    const handleOpen = async () => {
        if (documento.url_recurso) {
            const url = documento.url_recurso.startsWith('http') 
                ? documento.url_recurso 
                : `https://${documento.url_recurso}`;
            await Linking.openURL(url);
        } else {
            Alert.alert('Información', 'Este documento no tiene URL disponible');
        }
    };

    const handleEdit = () => {
        router.push(`/docs/edit/${documento.id_documento}`);
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar Documento',
            `¿Estás seguro de eliminar "${documento.titulo}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await documentosApi.delete(documento.id_documento);
                        if (success) {
                            Alert.alert('Éxito', 'Documento eliminado correctamente');
                            onRefresh();
                        } else {
                            Alert.alert('Error', 'No se pudo eliminar el documento');
                        }
                    }
                }
            ]
        );
    };

    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mx-5 my-2 border border-gray-200 shadow-sm"
            onPress={handleOpen}
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <Ionicons name="document-text-outline" size={22} color="#3B82F6" />
                        <Text className="text-black font-bold text-lg ml-2 flex-1">{documento.titulo}</Text>
                    </View>
                    
                    {documento.autor && (
                        <Text className="text-gray-500 text-sm mt-1 ml-7">
                             {documento.autor}
                        </Text>
                    )}
                    
                    {documento.materia && (
                        <Text className="text-gray-400 text-xs mt-1 ml-7">
                             {documento.materia}
                        </Text>
                    )}
                    
                    {documento.descripcion && (
                        <Text className="text-gray-500 text-sm mt-2 ml-7" numberOfLines={2}>
                            {documento.descripcion}
                        </Text>
                    )}
                </View>
                
                {/* Botones de acción */}
                <View className="flex-row items-center gap-2 ml-2">
                    <TouchableOpacity 
                        onPress={handleEdit}
                        className="bg-yellow-100 rounded-full p-2"
                    >
                        <Ionicons name="create-outline" size={18} color="#D97706" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={handleDelete}
                        className="bg-red-100 rounded-full p-2"
                    >
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                    
                    <Ionicons name="open-outline" size={20} color="#3B82F6" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ============================================
// PANTALLA PRINCIPAL
// ============================================
export default function RecursosScreen() {
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filtroMateria, setFiltroMateria] = useState<number | null>(null);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [loadingMore, setLoadingMore] = useState(false);

// app/(tabs)/docs/index.tsx

// ============================================
// ESTADOS PARA FILTROS
// ============================================
const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<number[]>([]);
const [modalMateriasVisible, setModalMateriasVisible] = useState(false);





useEffect(() => {
    cargarMaterias();
}, []);




// ============================================
// CONTAR FILTROS ACTIVOS
// ============================================
const totalFiltrosActivos = materiasSeleccionadas.length + (searchText ? 1 : 0);

// ============================================
// FUNCIONES
// ============================================
const toggleMateria = (id: number) => {
    if (materiasSeleccionadas.includes(id)) {
        setMateriasSeleccionadas(materiasSeleccionadas.filter(m => m !== id));
    } else {
        setMateriasSeleccionadas([...materiasSeleccionadas, id]);
    }
    setPage(1);
};

const limpiarFiltros = () => {
    setMateriasSeleccionadas([]);
    setSearchText('');
    setPage(1);
};







const cargarDocumentos = async (isLoadMore = false) => {
    if (isLoadMore) {
        setLoadingMore(true);
    } else {
        setLoading(true);
    }
    
    try {
        const data = await documentosApi.getAll({
            buscar: searchText || undefined,
            id_materia: filtroMateria || undefined,
            page,
            limit: 10
        });
        
        console.log('datita docs>>>>>', data);
        
        // Asegurar que siempre sea un array
        const documentosData = Array.isArray(data?.data) ? data.data : [];
        
        if (data?.pagination) {
            setTotalPages(data.pagination.pages);
        }
        
        if (isLoadMore) {
            setDocumentos(prev => [...prev, ...documentosData]);
            setLoadingMore(false);
        } else {
            setDocumentos(documentosData);
            setLoading(false);
        }
        
    } catch (error) {
        console.error('Error cargando documentos:', error);
        if (isLoadMore) {
            setLoadingMore(false);
        } else {
            setLoading(false);
        }
        setDocumentos([]);
    }
};

const loadMore = () => {
    if (page < totalPages && !loadingMore) {
        setPage(prev => prev + 1);
    }
};
    useFocusEffect(
        useCallback(() => {
            cargarDatos();
        }, []) 
    );

    const cargarDatos = async () => {
        setLoading(true);
        await Promise.all([
            cargarDocumentos(),
            cargarMaterias()
        ]);
        setLoading(false);
    };


    const cargarMaterias = async () => {
        const data = await materiasApi.getAll();
        setMaterias(data);
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarDocumentos();
    };

    // Filtrar documentos
   // app/(tabs)/docs/index.tsx

// Filtrar documentos
const documentosFiltrados = documentos && documentos.length > 0 
    ? documentos.filter(doc => {
        if (searchText && !doc.titulo.toLowerCase().includes(searchText.toLowerCase()) &&
            !doc.autor?.toLowerCase().includes(searchText.toLowerCase())) {
            return false;
        }
        if (filtroMateria && doc.id_materia !== filtroMateria) {
            return false;
        }
        return true;
    })
    : [];

    if (loading && documentos.length === 0) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-4">Cargando recursos...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-cyan-100  pt-2 pb-4 px-5">
                <Text className="text-sm">Documentos, libros y materiales de apoyo</Text>
            </View>

            {/* Buscador */}
            <View className="px-5 py-3">
                <View className="flex-row items-center bg-gray-100 rounded-xl">
                    <Ionicons name="search-outline" size={20} color="#9CA3AF" className="ml-3" />
                    <TextInput
                        className="flex-1 p-3 text-base"
                        placeholder="Buscar por título o autor..."
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

           {/* Badges de filtros activos */}
{totalFiltrosActivos > 0 && (
    <View className="px-5 pb-3 mt-2">
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row flex-wrap"
            contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}
        >
            {/* Badges de materias */}
            {materiasSeleccionadas.map(id => {
                const materia = materias.find(m => m.id_materia === id);
                return (
                    <TouchableOpacity
                        key={`m-${id}`}
                        className="flex-row items-center bg-yellow-100 rounded-full px-3 py-1.5 mr-2 mb-2"
                        onPress={() => toggleMateria(id)}
                    >
                        <Text className="text-black text-sm">{materia?.nombre}</Text>
                        <Ionicons name="close-circle" size={16} color="#000000" className="ml-1" />
                    </TouchableOpacity>
                );
            })}

            {/* Badge de búsqueda */}
            {searchText !== '' && (
                <TouchableOpacity
                    className="flex-row items-center bg-yellow-100 rounded-full px-3 py-1.5 mr-2 mb-2"
                    onPress={() => setSearchText('')}
                >
                    <Text className="text-black text-sm">🔍 {searchText}</Text>
                    <Ionicons name="close-circle" size={16} color="#000000" className="ml-1" />
                </TouchableOpacity>
            )}

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
        {/* Botón filtro materias */}
        <TouchableOpacity
            className={`flex-row items-center rounded-full px-4 py-2 mr-2 ${
                materiasSeleccionadas.length > 0 ? 'bg-yellow-500' : 'bg-gray-200'
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
            <Ionicons
                name="chevron-down"
                size={14}
                color={materiasSeleccionadas.length > 0 ? '#000000' : '#6B7280'}
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




            {/* Contador */}
            <View className="px-5 pb-2">
                <Text className="text-gray-500 text-sm">
                    {documentosFiltrados.length} recurso{documentosFiltrados.length !== 1 ? 's' : ''} encontrado{documentosFiltrados.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Lista */}
            <FlatList
                data={documentosFiltrados}
                keyExtractor={(item) => item.id_documento.toString()}
                renderItem={({ item }) => (
                    <DocumentoCard documento={item} onRefresh={cargarDocumentos} />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
                }
                ListEmptyComponent={() => (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-center mt-4">
                            {searchText ? 'No se encontraron recursos' : 'No hay recursos disponibles'}
                        </Text>
                        <Text className="text-gray-400 text-center text-sm mt-2">
                            Agrega documentos, enlaces y materiales de apoyo
                        </Text>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* Botón flotante */}
            <Pressable
                className="absolute bottom-6 right-6 bg-blue-500 rounded-full p-4 shadow-lg"
                onPress={() => router.push('/docs/create')}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </Pressable>


            {/* ==================== MODAL SELECCIÓN DE MATERIAS ==================== */}
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
                        className={`flex-row items-center justify-between p-3 mb-2 rounded-lg ${
                            materiasSeleccionadas.includes(materia.id_materia) ? 'bg-yellow-100' : 'bg-gray-50'
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
                    onPress={() => setMateriasSeleccionadas([])}
                >
                    <Text className="text-center text-gray-700">Limpiar todo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 bg-yellow-500 py-3 rounded-xl"
                    onPress={() => setModalMateriasVisible(false)}
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