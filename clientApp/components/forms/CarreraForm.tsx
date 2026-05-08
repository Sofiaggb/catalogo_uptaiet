// app/(tabs)/carreras/create.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import type { TipoCarrera } from '@/services/api/types';

export default function CreateCarreraScreen() {
    const [loading, setLoading] = useState(false);
    const [cargandoTipos, setCargandoTipos] = useState(true);
    const [tiposCarrera, setTiposCarrera] = useState<TipoCarrera[]>([]);
    
    // Dropdown
    const [open, setOpen] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState<number | null>(null);
    
    // Formulario
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
    });
    
    const [errors, setErrors] = useState({
        nombre: '',
    });

    useEffect(() => {
        cargarTipos();
    }, []);

    const cargarTipos = async () => {
        const tipos = await carrerasApi.getTipos();
        setTiposCarrera(tipos);
        setCargandoTipos(false);
    };

    const dropdownItems = tiposCarrera.map(t => ({
        label: t.nombre,
        value: t.id_tipo_carrera
    }));

    const handleSubmit = async () => {
        // Validar
        if (!form.nombre.trim()) {
            setErrors({ nombre: 'El nombre es obligatorio' });
            return;
        }

        setLoading(true);
        const result = await carrerasApi.create({
            nombre: form.nombre,
            descripcion: form.descripcion || undefined,
            id_tipo_carrera: selectedTipo || undefined
        });

        if (result) {
            Alert.alert('Éxito', 'Carrera creada correctamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Error', 'No se pudo crear la carrera');
        }
        setLoading(false);
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-black pt-16 pb-6 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back-outline" size={28} color="#FFD700" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-yellow-500 text-2xl font-bold">Crear Carrera</Text>
                        <Text className="text-white text-sm">Completa los datos de la nueva carrera</Text>
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
                {cargandoTipos ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
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
                )}

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
                        <Text className="text-white text-lg font-bold">Crear Carrera</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}