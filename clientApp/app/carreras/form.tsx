// app/carreras/form.tsx
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
import { carrerasApi } from '@/services/api/endpoints/carreras';
import type { Carrera, TipoCarrera } from '@/services/api/types';

interface CarreraFormProps {
    mode: 'create' | 'edit';
}

export default function CarreraForm({ mode }: CarreraFormProps) {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEditing = mode === 'edit';
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    
    // Dropdown tipos de carrera
    const [open, setOpen] = useState(false);
    const [tiposCarrera, setTiposCarrera] = useState<TipoCarrera[]>([]);
    const [selectedTipo, setSelectedTipo] = useState<number | null>(null);
    
    // Formulario
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
    });
    
    const [errors, setErrors] = useState({
        nombre: '',
    });

    // Cargar tipos de carrera
    useEffect(() => {
        cargarTipos();
    }, []);

    // Cargar datos si es edición
    useEffect(() => {
        if (isEditing && id) {
            cargarDatos();
        }
    }, [isEditing, id]);

    const cargarTipos = async () => {
        const tipos = await carrerasApi.getTipos();
        setTiposCarrera(tipos);
    };

    const cargarDatos = async () => {
        setLoadingData(true);
        const carrera = await carrerasApi.getById(Number(id));
        if (carrera) {
            setForm({
                nombre: carrera.nombre || '',
                descripcion: carrera.descripcion || '',
            });
            setSelectedTipo(carrera.id_tipo_carrera || null);
        }
        setLoadingData(false);
    };

    const handleSubmit = async () => {
        // Validar
        if (!form.nombre.trim()) {
            setErrors({ nombre: 'El nombre es obligatorio' });
            return;
        }

        setLoading(true);
        
        let result;
        // if (isEditing && id) {
        //     result = await carrerasApi.update(Number(id), {
        //         nombre: form.nombre,
        //         descripcion: form.descripcion || undefined,
        //         id_tipo_carrera: selectedTipo || undefined
        //     });
        // } else {
        //     result = await carrerasApi.create({
        //         nombre: form.nombre,
        //         descripcion: form.descripcion || undefined,
        //         id_tipo_carrera: selectedTipo || undefined
        //     });
        // }

        if (result) {
            Alert.alert('Éxito', `Carrera ${isEditing ? 'actualizada' : 'creada'} correctamente`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Error', `No se pudo ${isEditing ? 'actualizar' : 'crear'} la carrera`);
        }
        setLoading(false);
    };

    const dropdownItems = tiposCarrera.map(t => ({
        label: t.nombre,
        value: t.id_tipo_carrera
    }));

    if (loadingData) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-4">Cargando datos...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 ">
            {/* Header */}
            <View className=" pt-6 pb-6 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back-outline" size={28} color="#0ea5e8" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-cyan-600 text-2xl font-bold">
                            {isEditing ? 'Editar Carrera' : 'Crear Carrera'}
                        </Text>
                        <Text className="text-sky-400 text-sm">
                            {isEditing ? 'Modifica los datos de la carrera' : 'Completa los datos de la nueva carrera'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Formulario */}
            <View className="p-5">
                {/* Nombre */}
                <Text className="text-base font-semibold text-gray-700 mb-2">
                    Nombre de la carrera <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                    className={`bg-white border rounded-lg p-3 text-base mb-2 ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={form.nombre}
                    onChangeText={(text) => {
                        setForm({ ...form, nombre: text });
                        if (errors.nombre) setErrors({ nombre: '' });
                    }}
                    placeholder="Ej: Ingeniería Informática"
                    placeholderTextColor="#999"
                />
                {errors.nombre && (
                    <Text className="text-red-500 text-sm mb-3">{errors.nombre}</Text>
                )}

                {/* Tipo de carrera */}
                <Text className="text-base font-semibold text-gray-700 mb-2">Tipo de carrera</Text>
                <DropDownPicker
                    open={open}
                    value={selectedTipo}
                    items={dropdownItems}
                    setOpen={setOpen}
                    setValue={setSelectedTipo}
                    placeholder="Selecciona un tipo"
                    searchable={true}
                    searchPlaceholder="🔍 Buscar tipo..."
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
                    placeholder="Descripción de la carrera"
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
                            {isEditing ? 'Actualizar Carrera' : 'Crear Carrera'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}