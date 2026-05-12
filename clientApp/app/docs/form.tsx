// app/(tabs)/recursos/create.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { documentosApi } from '@/services/api/endpoints/documentos';
import { materiasApi } from '@/services/api/endpoints/materias';
import type { Materia } from '@/services/api/types';

export default function RecursoForm() {
    const { id } = useLocalSearchParams();
    const isEditing = !!id;
    
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [openMateria, setOpenMateria] = useState(false);
    const [selectedMateria, setSelectedMateria] = useState<number | null>(null);
    
    const [form, setForm] = useState({
        titulo: '',
        autor: '',
        url_recurso: '',
        descripcion: ''
    });

    useEffect(() => {
        cargarMaterias();
        if (isEditing) {
            cargarDocumento();
        }
    }, []);

    const cargarMaterias = async () => {
        const data = await materiasApi.getAll();
        setMaterias(data);
    };

    const cargarDocumento = async () => {
        const documento = await documentosApi.getById(Number(id));
        if (documento) {
            setForm({
                titulo: documento.titulo || '',
                autor: documento.autor || '',
                url_recurso: documento.url_recurso || '',
                descripcion: documento.descripcion || ''
            });
            setSelectedMateria(documento.id_materia);
        }
        setLoadingData(false);
    };

    const dropdownItems = materias.map(m => ({
        label: m.nombre,
        value: m.id_materia
    }));

    const handleSubmit = async () => {
        if (!form.titulo.trim()) {
            Alert.alert('Error', 'El título es obligatorio');
            return;
        }
        if (!selectedMateria) {
            Alert.alert('Error', 'Debes seleccionar una materia');
            return;
        }

        setLoading(true);
        
        const data = {
            titulo: form.titulo,
            autor: form.autor || undefined,
            url_recurso: form.url_recurso || undefined,
            descripcion: form.descripcion || undefined,
            id_materia: selectedMateria
        };
        
        let result;
        if (isEditing) {
            result = await documentosApi.update(Number(id), data);
        } else {
            result = await documentosApi.create(data);
        }
        
        if (result.success) {
            Alert.alert('Éxito', `Recurso ${isEditing ? 'actualizado' : 'creado'} correctamente`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Error', result.message || 'No se pudo guardar el recurso');
        }
        
        setLoading(false);
    };

    if (loadingData) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-4">Cargando...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-black pt-16 pb-6 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back-outline" size={28} color="#FFD700" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-yellow-500 text-2xl font-bold">
                            {isEditing ? 'Editar Recurso' : 'Nuevo Recurso'}
                        </Text>
                        <Text className="text-white text-sm">
                            {isEditing ? 'Modifica los datos del recurso' : 'Completa los datos del recurso'}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="p-5">
                {/* Título */}
                <Text className="text-base font-semibold text-gray-700 mb-2">
                    Título <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 text-base mb-4"
                    value={form.titulo}
                    onChangeText={(text) => setForm({ ...form, titulo: text })}
                    placeholder="Título del documento o recurso"
                    placeholderTextColor="#999"
                />

                {/* Autor */}
                <Text className="text-base font-semibold text-gray-700 mb-2">Autor</Text>
                <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 text-base mb-4"
                    value={form.autor}
                    onChangeText={(text) => setForm({ ...form, autor: text })}
                    placeholder="Nombre del autor"
                    placeholderTextColor="#999"
                />

                {/* URL */}
                <Text className="text-base font-semibold text-gray-700 mb-2">Enlace (URL)</Text>
                <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 text-base mb-4"
                    value={form.url_recurso}
                    onChangeText={(text) => setForm({ ...form, url_recurso: text })}
                    placeholder="https://ejemplo.com/documento.pdf"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                />

                {/* Materia */}
                <Text className="text-base font-semibold text-gray-700 mb-2">
                    Materia <Text className="text-red-500">*</Text>
                </Text>
                <DropDownPicker
                    open={openMateria}
                    value={selectedMateria}
                    items={dropdownItems}
                    setOpen={setOpenMateria}
                    setValue={setSelectedMateria}
                    placeholder="Selecciona una materia"
                    searchable={true}
                    searchPlaceholder="🔍 Buscar materia..."
                    listMode="MODAL"
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#D1D5DB',
                        borderRadius: 8,
                    }}
                    dropDownContainerStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#D1D5DB',
                    }}
                />

                {/* Descripción */}
                <Text className="text-base font-semibold text-gray-700 mb-2 mt-4">Descripción</Text>
                <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 text-base min-h-[100px]"
                    value={form.descripcion}
                    onChangeText={(text) => setForm({ ...form, descripcion: text })}
                    placeholder="Breve descripción del contenido"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                {/* Botón */}
                <TouchableOpacity
                    className={`mt-6 py-4 rounded-xl items-center ${loading ? 'bg-blue-400' : 'bg-blue-500'}`}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-white text-lg font-bold">
                            {isEditing ? 'Actualizar Recurso' : 'Crear Recurso'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}