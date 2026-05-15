// app/tesis/crear.tsx
import { validateLibroForm } from '@/app/helpers/validations';
import { librosApi } from '@/services/api/endpoints/libros';
import { materiasApi } from '@/services/api/endpoints/materias';
import { tesisApi } from '@/services/api/endpoints/tesis';
import {  Materia } from '@/services/api/types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// Interfaces locales para el estado del formulario
// recibe las props directamente
interface TesisFormProps {
    mode?: 'create' | 'edit';
    tesisId?: string;
}

export default function LibroForm({ mode: propMode, tesisId: propTesisId }: TesisFormProps = {}) {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Determinar modo: primero de props, luego de params, luego por defecto 'create'
    const isEditing = propMode === 'edit' || params.mode === 'edit';
    const tesisId = propTesisId || (params.id as string);
    //  console.log(tesisId)
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    const [materias, setMaterias] = useState<Materia[]>([]);

    // Dropdowns
    const [open, setOpen] = useState(false);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [anioElaboracion, setAnioElaboracion] = useState<number | null>(null);
    const [openAnio, setOpenAnio] = useState(false);


    // Datos principales de la tesis
    const [form, setForm] = useState({
        titulo: '',
        autor: '',
        editorial: '',
        id_materia: '',
        id_year: '',
        url_documento: ''
    });

    const [documento, setDocumento] = useState<{
        uri: string;
        name: string;
        size: number;
        mimeType: string;
    } | null>(null);

    const [documentoOriginal, setDocumentoOriginal] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{
        titulo?: string;
        autor?: string;
        editorial?: string;
        id_materia?: string;
        id_year?: string;
        documento?: string;
    }>({});

    // Generar años disponibles (desde 1990 hasta el próximo año)
    const aniosDisponibles = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear + 1; i >= 1600; i--) {
            years.push({ label: i.toString(), value: i });
        }
        return years;
    }, []);

    // Cargar materias al iniciar
    useEffect(() => {
        cargarMaterias();
    }, []);

    // Cargar datos si es edición
    useEffect(() => {
        if (isEditing && tesisId) {
            // console.log('si paso a editdm')
            cargarDatosTesis();
        }
    }, [isEditing, tesisId]);

    const cargarMaterias = async () => {
        const lista = await materiasApi.getAll();
        // console.log('lista materias >> ', lista)
        setMaterias(lista);
    };

    const cargarDatosTesis = async () => {
        setLoadingData(true);
        try {
            const response = await tesisApi.getById(Number(tesisId));
            if (response.success && response.data) {
                const tesis = response.data;
                // console.log(tesis)
                // Cargar datos principales
                setForm({
                    titulo: tesis.titulo || '',
                    autor: tesis.resumen || '',
                    editorial: tesis.editorial || '',

                    id_materia: tesis.id_materia ? tesis.id_materia.toString() : '',
                    id_year: tesis.id_year ? tesis.id_year.toString() : '',
                    url_documento: tesis.url_documento || ''
                });
                setSelectedMateria(tesis.id_materia.toString());
                console.log(tesis.id_materia)

                setAnioElaboracion(tesis.anio_elaboracion);
                setDocumentoOriginal(tesis.url_documento);


            }
        } catch (error) {
            console.error('Error cargando tesis:', error);
            Alert.alert('Error', 'No se pudo cargar la tesis para editar');
        } finally {
            setLoadingData(false);
        }
    };

    /////////////////////////////////////
    // documenos 
    ////////////////////////////////////
    // Función para seleccionar archivo
    const seleccionarDocumento = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],  // Solo PDF
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets[0]) {
                const file = result.assets[0];
                setDocumento({
                    uri: file.uri,
                    name: file.name,
                    size: file.size || 0,
                    mimeType: file.mimeType || 'application/pdf'
                });
                setForm({ ...form, url_documento: file.name });  // Guardar nombre
                console.log(' Archivo seleccionado:', file.name);
                // Limpiar error del documento
                setFieldErrors(prev => ({ ...prev, documento: undefined }));
            }
        } catch (error) {
            console.error('Error seleccionando documento:', error);
            Alert.alert('Error', 'No se pudo seleccionar el archivo');
        }
    };

    // Función para limpiar el archivo seleccionado
    const limpiarDocumento = () => {
        if (documento) {
            setDocumento(null);
            setForm(prev => ({ ...prev, url_documento: '' }));
        }
    };

    // Usar useMemo para evitar recalcular items en cada render
    const dropdownItems = useMemo(() => {
        return materias.map(c => ({
            label: c.nombre,
            value: c.id_materia.toString()
        }));
    }, [materias]);  // Solo se recalcula cuando materias cambia

    // Manejar cambio de materia
    const handleMateriaChange = useCallback((val: any) => {
        setSelectedMateria(val);
        setForm(prev => ({ ...prev, id_materia: val || '' }));
        // Limpiar error de materia
        setFieldErrors(prev => ({ ...prev, id_materia: undefined }));
    }, []);


    // manejar cambio de año 
    const handleAnioChange = useCallback((val: number | null) => {
        console.log('Año seleccionado:', val); // Para debug
        setAnioElaboracion(val);
        setForm(prev => ({ ...prev, id_year: val?.toString() || '' }));
        // Limpiar error del año usando la misma clave que en fieldErrors
        setFieldErrors(prev => ({ ...prev, id_year: undefined }));
    }, []);


    // Manejar cambios en campos principales
    const handleChange = (campo: string, valor: string) => {
        setForm({ ...form, [campo]: valor });
        // Limpiar error del campo cuando el usuario escribe
        if (fieldErrors[campo as keyof typeof fieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [campo]: undefined }));
        }
    };


    // ==================== ENVÍO DEL FORMULARIO ====================

    const handleSubmit = async () => {
        // Validaciones
        const tieneDocumento = !!(documento || (isEditing && documentoOriginal));
        const tesisValidation = validateLibroForm({
            titulo: form.titulo,
            autor: form.autor,
            editorial: form.editorial,
            id_materia: form.id_materia,
            id_year: form.id_year,
            tieneDocumento: tieneDocumento
        });

        if (!tesisValidation.isValid) {
            setFieldErrors(tesisValidation.errors);
            Alert.alert('Error', 'Por favor completa los campos obligatorios');
            return;
        }

        setLoading(true);

        const formData = new FormData();

        formData.append('id_materia', form.id_materia);
        formData.append('titulo', form.titulo);
        formData.append('autor', form.autor || '');
        formData.append('editorial', form.editorial || '');
        formData.append('year', form.id_year);

        // Agregar el archivo PDF o modificar
        if (isEditing) {
            // Modo edición
            if (documento) {
                // Hay un documento NUEVO seleccionado - reemplazar
                const fileInfo = {
                    uri: documento.uri,
                    type: documento.mimeType || 'application/pdf',
                    name: documento.name || 'documento.pdf'
                };
                formData.append('archivo_pdf', fileInfo as any);
                formData.append('reemplazar_documento', 'true');
            } else if (documentoOriginal) {
                // Mantener el documento original
                formData.append('mantener_documento', 'true');
                formData.append('url_documento_original', documentoOriginal);
            }
        } else {
            // Modo creación
            if (documento) {
                const fileInfo = {
                    uri: documento.uri,
                    type: documento.mimeType || 'application/pdf',
                    name: documento.name || 'documento.pdf'
                };
                formData.append('archivo_pdf', fileInfo as any);
            }
        }

        let resultado;
        if (isEditing) {
            resultado = await librosApi.update(Number(tesisId), formData);
            console.log('actualizar', resultado)

        } else {
            resultado = await librosApi.create(formData);
        }
        setLoading(false);

        if (resultado.success) {
            Alert.alert('Éxito', resultado.message, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            console.log('resultado libro >>> ', resultado)
            Alert.alert('Error', resultado.message || 'No se pudo crear la tesis');
        }
    };

    if (loadingData) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#FFD700" />
                <Text className="text-gray-500 mt-4">Cargando tesis...</Text>
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView
            className="flex-1 bg-gray-100"
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={100}
            enableOnAndroid={true}
        >
            <ScrollView className="flex-1 bg-white">
                {/* Header con los colores de la app */}
                <View className=" pt-6 pb-6 px-5">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <Ionicons name="arrow-back-outline" size={28} color="#0ea5e8" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-cyan-600 text-2xl font-bold">
                                {isEditing ? 'Editar libro' : 'Crear libro'}
                            </Text>
                            <Text className="text-sky-400 text-sm">
                                {isEditing ? 'Modifica los datos del libro' : 'Completa todos los campos'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Formulario */}
                <View className="p-5">
                    {/* ==================== DATOS BÁSICOS ==================== */}
                    <View className="mb-6">
                    {/* ==================== materia ==================== */}

                         <Text className="text-base font-semibold text-gray-700 mb-2">
                                Materia *
                            </Text>
                            <View className={`mb-4 z-10 ${fieldErrors.id_materia ? 'border-red-500 border rounded-lg' : ''}`}>
                                <DropDownPicker
                                    open={open}
                                    value={selectedMateria}
                                    items={dropdownItems}
                                    setOpen={setOpen}
                                    setValue={setSelectedMateria}
                                    placeholder="Selecciona la materia"
                                    searchable={true}
                                    searchPlaceholder="Buscar materia..."
                                    listMode="MODAL"
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderColor: fieldErrors.id_materia ? '#EF4444' : '#D1D5DB',
                                        borderRadius: 8,
                                    }}
                                    dropDownContainerStyle={{
                                        backgroundColor: '#FFFFFF',
                                        borderColor: '#D1D5DB',
                                    }}
                                    onChangeValue={handleMateriaChange}
                                />
                            </View>
                            {fieldErrors.id_materia && (
                                <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.id_materia}</Text>
                            )}

                    {/* ==================== TITULO ==================== */}
                        <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <Text className="text-base font-semibold text-gray-700 mb-2">
                                Título *
                            </Text>
                            <TextInput
                                className={`bg-white border rounded-lg p-3 text-base mb-4 ${fieldErrors.titulo ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                value={form.titulo}
                                onChangeText={(text) => handleChange('titulo', text)}
                                placeholder="Ingrese el título del libro"
                                placeholderTextColor="#999"
                            />
                            {fieldErrors.titulo && (
                                <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.titulo}</Text>
                            )}

                    {/* ==================== AUTOR ==================== */}
                            <Text className="text-base font-semibold text-gray-700 mb-2">
                                Autor(es) <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                className={`bg-white border rounded-lg p-3 text-base mb-4 ${fieldErrors.autor ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                value={form.autor}
                                onChangeText={(text) => handleChange('autor', text)}
                                placeholder="Ingrese el autor o autores"
                                placeholderTextColor="#999"
                            />
                            {fieldErrors.autor && (
                                <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.autor}</Text>
                            )}

                    {/* ==================== EDITORIAL ==================== */}
                            <Text className="text-base font-semibold text-gray-700 mb-2">
                                Editorial <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                className={`bg-white border rounded-lg p-3 text-base mb-4 ${fieldErrors.editorial ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                value={form.editorial}
                                onChangeText={(text) => handleChange('editorial', text)}
                                placeholder="Ingrese la editorial"
                                placeholderTextColor="#999"
                            />
                            {fieldErrors.editorial && (
                                <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.editorial}</Text>
                            )}

                           
                            {/* ==================== AÑO DE ELABORACIÓN ==================== */}
                            <Text className="text-base font-semibold text-gray-700 mb-2">
                                Año <Text className="text-red-500">*</Text>
                            </Text>
                            <View className={`mb-4 z-10`}>
                                <DropDownPicker
                                    open={openAnio}
                                    value={anioElaboracion}
                                    items={aniosDisponibles}
                                    setOpen={setOpenAnio}
                                    setValue={setAnioElaboracion}
                                    placeholder="Selecciona el año de publicación"
                                    searchable={true}
                                    searchPlaceholder="Buscar año..."
                                    listMode="MODAL"
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderColor: fieldErrors.id_year ? '#EF4444' : '#D1D5DB',
                                        borderRadius: 8,
                                    }}
                                    dropDownContainerStyle={{
                                        backgroundColor: '#FFFFFF',
                                        borderColor: '#D1D5DB',
                                    }}
                                    onChangeValue={handleAnioChange}
                                />
                                {fieldErrors.id_year && (
                                    <Text className="text-red-500 text-sm mt-1">{fieldErrors.id_year}</Text>
                                )}
                            </View>


                            {/* Documento PDF  */}
                            {/* Documento actual (en edición) */}
                            {documentoOriginal && !documento && (
                                <View className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-3">
                                    <View className="flex-row items-center">
                                        <Ionicons name="document-text" size={20} color="#6B7280" />
                                        <Text className="text-gray-600 text-sm ml-2 flex-1" numberOfLines={1}>
                                            Documento actual: {documentoOriginal.split('/').pop()}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Nuevo documento seleccionado */}
                            {documento && (
                                <View className="bg-green-50 border border-green-300 rounded-lg p-3 mb-3 flex-row justify-between items-center">
                                    <Text className="text-green-700 flex-1">{documento.name}</Text>
                                    <TouchableOpacity onPress={limpiarDocumento}>
                                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Botón para cambiar documento */}
                            {!documento && (
                                <TouchableOpacity
                                    className="bg-gray-50 border border-gray-300 rounded-lg p-4 items-center border-dashed"
                                    onPress={seleccionarDocumento}
                                >
                                    <Ionicons name="cloud-upload-outline" size={32} color="#6B7280" />
                                    <Text className="text-gray-600 text-base mt-2">
                                        {documentoOriginal ? 'Cambiar documento PDF' : 'Seleccionar documento PDF'}
                                    </Text>
                                </TouchableOpacity>
                            )}

                        </View>
                    </View>



                    {/* Botón Enviar */}
                    <TouchableOpacity
                        className="bg-cyan-200 py-4 rounded-xl items-center mt-4 mb-10 flex-row justify-center"
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000000" />
                        ) : (
                            <Text className=" text-lg font-bold ml-2">
                                {isEditing ? 'Actualizar ' : 'Registrar '}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAwareScrollView>
    );
}