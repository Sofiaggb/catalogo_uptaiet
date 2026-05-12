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
import { carrerasApi } from '@/services/api/endpoints/carreras';
import { materiasApi } from '@/services/api/endpoints/materias';

interface CarreraFormProps {
    mode: 'create' | 'edit';
}

export default function MateriaForm({ mode }: CarreraFormProps) {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEditing = mode === 'edit';
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    // Formulario
    const [form, setForm] = useState({ nombre: '' });
    const [fieldErrors, setFieldErrors] = useState<{ nombre?: string; }>({});

    // Cargar datos si es edición
    useEffect(() => {
        if (isEditing && id) {
            cargarDatos();
        }
    }, [isEditing, id]);

    const cargarDatos = async () => {
        setLoadingData(true);
        const materia = await materiasApi.getById(Number(id));
        if (materia) {
            setForm({
                nombre: materia.nombre || '',
            });   
        }
        setLoadingData(false);
    };

    // Manejar cambios en campos principales
    const handleChange = (campo: string, valor: string) => {
        setForm({ ...form, [campo]: valor });
        // Limpiar error del campo cuando el usuario escribe
        if (fieldErrors[campo as keyof typeof fieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [campo]: undefined }));
        }
    };

    const handleSubmit = async () => {
        // Validaciones
        const errors: { nombre?: string;} = {};
    
        if (!form.nombre.trim()) {
            errors.nombre = 'El nombre de la materia es obligatorio';
        } else if (form.nombre.length < 3) {
            errors.nombre = 'El nombre debe tener al menos 3 caracteres';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            Alert.alert('Error', 'Por favor completa los campos obligatorios');
            return;
        }

        setLoading(true);

        const data = {
                nombre: form.nombre 
            }

        let result;
        if (isEditing && id) {
            result = await materiasApi.update(Number(id), data);
        } else {
            result = await materiasApi.create(data);
        }
            // console.log('result carrera>>>>>>>>>>>< ',result)

        if (result.success) {
            Alert.alert('Éxito', result.message, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            console.log('result mteria>',result)
            Alert.alert('Error', result.message || 'No se pudo crear la materia');
        }
        setLoading(false);
    };

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
                            {isEditing ? 'Editar Materia' : 'Crear Materia'}
                        </Text>
                        <Text className="text-sky-400 text-sm">
                            {isEditing ? 'Modifica los datos de la materia' : 'Completa los datos de la nueva materia'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Formulario */}
            <View className="p-5">
                {/* Nombre */}
                <Text className="text-base font-semibold text-gray-700 mb-2">
                    Nombre de la materia <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                    className={`bg-white border rounded-lg p-3 text-base mb-4 
                        ${fieldErrors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                    value={form.nombre}
                    onChangeText={(text) => handleChange('nombre', text)}
                    placeholder="Ej: Ingeniería Informática"
                    placeholderTextColor="#999"
                />
                {fieldErrors.nombre && (
                    <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.nombre}</Text>
                )}

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
                            {isEditing ? 'Actualizar ' : 'Registrar '}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}