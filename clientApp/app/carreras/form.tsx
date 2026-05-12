// app/carreras/form.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { Carrera, TipoCarrera, TipoTrabajo } from '@/services/api/types';
import { validateRequired } from '../helpers/validations';

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
    const [tiposTrabajo, setTiposTrabajo] = useState<TipoTrabajo[]>([]);
    const [selectedTipoTrabajo, setSelectedTipoTrabajo] = useState<number | null>(null);
    const [cargandoTipos, setCargandoTipos] = useState(false);
    const [openTipoTrabajo, setOpenTipoTrabajo] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    // Formulario
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
    });

    const [fieldErrors, setFieldErrors] = useState<{
        nombre?: string;
        tipo_carrera?: string;
        tipo_trabajo?: string;
    }>({});

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

    useEffect(() => {
        if (!isInitialLoad && selectedTipo) {
            cargarTiposTrabajo(selectedTipo);
        } else {
            setTiposTrabajo([]);
            setSelectedTipoTrabajo(null);
        }
    }, [selectedTipo, isInitialLoad]);


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
            cargarTiposTrabajo(carrera.id_carrera, carrera.id_tipo_trabajo )
            // Marcamos que la carga inicial terminó
            setIsInitialLoad(false);
        }
        setLoadingData(false);
    };

    // FUNCIÓN PARA CARGAR TIPOS DE TRABAJO
    const cargarTiposTrabajo = async (idCarrera: number, idTrabajo?:number) => {
        setCargandoTipos(true);
        try {
            const tipos = await carrerasApi.getTiposTrabajoByCarrera(idCarrera);
            setTiposTrabajo(tipos);
            // Si solo hay un tipo, seleccionarlo automáticamente
            if (idTrabajo) {
                setSelectedTipoTrabajo(idTrabajo);                
            } else if (tipos.length === 1) {
                setSelectedTipoTrabajo(tipos[0].id_tipo_trabajo);
            } else {
                setSelectedTipoTrabajo(null);
            }
        } catch (error) {
            console.error('Error cargando tipos de trabajo:', error);
            setTiposTrabajo([]);
        } finally {
            setCargandoTipos(false);
        }
    };

    // PREPARAR ITEMS PARA EL DROPDOWN
    // ============================================
    const tipoTrabajoItems = useMemo(() => {
        return tiposTrabajo.map(t => ({
            label: t.nombre,
            value: t.id_tipo_trabajo
        }));
    }, [tiposTrabajo]);

    // ============================================
    // MANEJAR CAMBIO DE TIPO DE TRABAJO
    // ============================================
    const handleTipoTrabajoChange = useCallback((val: number | null) => {
        setSelectedTipoTrabajo(val);
    }, []);

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
        const errors: { nombre?: string; tipo_carrera?: string; tipo_trabajo?: string} = {};
    
        if (!form.nombre.trim()) {
            errors.nombre = 'El nombre de la carrera es obligatorio';
        } else if (form.nombre.length < 3) {
            errors.nombre = 'El nombre debe tener al menos 3 caracteres';
        }
        
        if (!selectedTipo) {
            errors.tipo_carrera = 'Debes seleccionar un tipo de carrera';
        }
         
        if (!selectedTipoTrabajo) {
            errors.tipo_trabajo = 'Debes seleccionar un tipo de trabajo';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            Alert.alert('Error', 'Por favor completa los campos obligatorios');
            return;
        }

        setLoading(true);

        const data = {
                nombre: form.nombre,
                descripcion: form.descripcion ,
                id_tipo_carrera: selectedTipo   ,
                id_tipo_trabajo: selectedTipoTrabajo  
            }
            console.log('data carrera>>>>>>>>>>>< ',data)

        let result;
        if (isEditing && id) {
            result = await carrerasApi.update(Number(id), data);
        } else {
            result = await carrerasApi.create(data);
        }
            // console.log('result carrera>>>>>>>>>>>< ',result)

        if (result.success) {
            Alert.alert('Éxito', result.message, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            console.log('result carrera>',result)
            Alert.alert('Error', result.message || 'No se pudo crear la tesis');
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

                {/* Tipo de carrera */}
                <Text className="text-base font-semibold text-gray-700 mb-2">Tipo de carrera</Text>
                <View className={`mb-4 z-10 ${fieldErrors.tipo_carrera ? 'border-red-500 border rounded-lg' : ''}`}>
                    <DropDownPicker
                        open={open}
                        value={selectedTipo}
                        items={dropdownItems}
                        setOpen={setOpen}
                        setValue={setSelectedTipo}
                        placeholder="Selecciona un tipo"
                        searchable={true}
                        searchPlaceholder="Buscar tipo..."
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
                </View>
                {fieldErrors.tipo_carrera && (
                    <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.tipo_carrera}</Text>
                )}

                {/* ==================== TIPO DE TRABAJO ==================== */}
                {tiposTrabajo.length > 0 && (
                    <>
                   <View className={`mb-4 z-10 ${fieldErrors.tipo_trabajo ? 'border-red-500 border rounded-lg' : ''}`}>
                     <Text className="text-base font-semibold text-gray-700 mb-2">
                            Tipo de Trabajo {tiposTrabajo.length === 1 && <Text className="text-blue-500">(automático)</Text>}
                        </Text>

                        {cargandoTipos ? (
                            <ActivityIndicator size="small" color="#3B82F6" />
                        ) : tiposTrabajo.length === 1 ? (
                            // Mostrar como texto si solo hay una opción
                            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <Text className="text-blue-700 font-semibold">{tiposTrabajo[0].nombre}</Text>
                            </View>
                        ) : (
                            // Dropdown si hay múltiples opciones
                            <DropDownPicker
                                open={openTipoTrabajo}
                                value={selectedTipoTrabajo}
                                items={tipoTrabajoItems}
                                setOpen={setOpenTipoTrabajo}
                                setValue={setSelectedTipoTrabajo}
                                placeholder="Selecciona el tipo de trabajo"
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
                                onChangeValue={handleTipoTrabajoChange}
                            />
                        )}
                    </View>
                    {fieldErrors.tipo_trabajo && (
                        <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.tipo_trabajo}</Text>
                    )}
                    </>
                    
                )}

                {/* Descripción */}
                <Text className="text-base font-semibold text-gray-700 mb-2 mt-4">Descripción</Text>
                <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 text-base min-h-[100px]"
                    value={form.descripcion}
                    onChangeText={(text) => handleChange('descripcion', text)}
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
                            {isEditing ? 'Actualizar ' : 'Registrar '}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}