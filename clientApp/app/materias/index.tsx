// app/materias/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { materiasApi } from '@/services/api/endpoints/materias';
import type { Materia } from '@/services/api/types';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Componente de tarjeta de materia con acciones
const MateriaCard = ({ materia, onRefresh }: { materia: Materia; onRefresh: () => void }) => {
    
    const handleEdit = () => {
        router.push(`/materias/edit/${materia.id_materia}`);
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar Materia',
            `¿Estás seguro de eliminar "${materia.nombre}"?
            \n\nEsta acción no se puede deshacer, no se podran subir mas recursos asociados a esta materia`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await materiasApi.delete(materia.id_materia);
                        // console.log(success)
                        if (success) {
                            Alert.alert('Éxito', 'Materia eliminada correctamente');
                            onRefresh(); // Recargar la lista
                        } else {
                            Alert.alert('Error', 'No se pudo eliminar la materia');
                        }
                    }
                }
            ]
        );
    };

    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mx-5 my-2 border border-gray-200 shadow-sm"
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between ">
                <View className="flex-1 text-center">
                        <Text className="font-bold text-lg flex-1">{materia.nombre}</Text>                                         
                </View>
                
                {/* Botones de acción */}
                <View className="flex-row gap-3 ml-2">
                    {/* Botón Editar */}
                    <TouchableOpacity
                        className="bg-yellow-100 rounded-full p-3"
                        onPress={handleEdit}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="create-outline" size={18} color="#D97706" />
                    </TouchableOpacity>
                    
                    {/* Botón Eliminar */}
                    <TouchableOpacity
                        className="bg-red-100 rounded-full p-3"
                        onPress={handleDelete}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                    
                   </View>
            </View>
        </TouchableOpacity>
    );
};

export default function MateriasListScreen() {
    const router = useRouter();
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [filteredMaterias, setFilteredMaterias] = useState<Materia[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filtros
    const [searchText, setSearchText] = useState('');

    // Recargar cada vez que la pantalla recibe foco
    useFocusEffect(
        useCallback(() => {
            cargarMaterias();
        }, [])
    );

    useEffect(() => {
        filtrarMaterias();
    }, [searchText, materias]);


    const cargarMaterias = async () => {
        setLoading(true);
        const data = await materiasApi.getAll();
        setMaterias(data);
        setFilteredMaterias(data);
        setLoading(false);
        setRefreshing(false);
    };

    const filtrarMaterias = () => {
        let filtered = [...materias];
        
        if (searchText.trim()) {
            filtered = filtered.filter(m =>
                m.nombre.toLowerCase().includes(searchText.toLowerCase()) 
            );
        }
      
        setFilteredMaterias(filtered);
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarMaterias();
    };

    if (loading && materias.length === 0) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-4">Cargando materias...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
             <View className=" pt-16 pb-4 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="w-10">
                        <Ionicons name="arrow-back-outline" size={28} color="#06b6d4" />
                    </TouchableOpacity>

                    <View className="flex-1 flex-row items-center justify-center gap-2">
                        <Text className="text-cyan-600 text-xl font-bold">
                            materias
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
                        placeholder="Buscar materia..."
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
                    {filteredMaterias.length} materia{filteredMaterias.length !== 1 ? 's' : ''} encontrada{filteredMaterias.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Lista */}
            <FlatList
                data={filteredMaterias}
                keyExtractor={(item) => item.id_materia.toString()}
                renderItem={({ item }) => (
                    <MateriaCard
                        materia={item}
                        onRefresh={cargarMaterias}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
                }
                ListEmptyComponent={() => (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="book-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-center mt-4">
                            {searchText ? 'No se encontraron materias' : 'No hay materias disponibles'}
                        </Text>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* Botón flotante para crear */}
            <Pressable
                className="absolute bottom-6 right-6 bg-sky-400  rounded-full p-4 shadow-lg"
                onPress={() => router.push('/materias/create')}
            >
                <Ionicons name="add" size={28} color="#000000" />
            </Pressable>
        </View>
    );
}