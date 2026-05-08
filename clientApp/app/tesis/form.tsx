// app/tesis/crear.tsx
import { validateEstudiante, validateEvaluacion, validateTesisForm } from '@/app/helpers/validations';
import { EstudianteForm } from '@/components/forms/EstudianteForm';
import { EvaluacionForm } from '@/components/forms/EvaluacionForm';
import { ConfirmarDatosModal } from '@/components/ui/ConfirmarDatosModal';
import { MultipleResultsModal } from '@/components/ui/multipleResultsmodal';
import { useEstudiantes } from '@/hooks/useEstudiantes';
import { useEvaluaciones } from '@/hooks/useEvaluaciones';
import { carrerasApi } from '@/services/api/endpoints/carreras';
import { tesisApi } from '@/services/api/endpoints/tesis';
import { Carrera } from '@/services/api/types';
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

export default function TesisForm({ mode: propMode, tesisId: propTesisId }: TesisFormProps = {}) {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Determinar modo: primero de props, luego de params, luego por defecto 'create'
    const isEditing = propMode === 'edit' || params.mode === 'edit';
    const tesisId = propTesisId || (params.id as string);
    //  console.log(tesisId)
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    const [carreras, setCarreras] = useState<Carrera[]>([]);

    // Dropdowns
    const [open, setOpen] = useState(false);
    const [selectedCarrera, setSelectedCarrera] = useState(null);
    const [anioElaboracion, setAnioElaboracion] = useState<number | null>(null);
    const [openAnio, setOpenAnio] = useState(false);

    // Hooks estudiantes evaluaciones
    const {
        estudiantes,
        buscando: buscandoEstudiante,
        modalVisible: modalEstudianteVisible,
        resultadoBusqueda: resultadoEstudiante,
        multipleModalVisible: multipleEstudianteVisible,
        resultadosMultiples: resultadosMultiplesEstudiantes,
        agregarEstudiante,
        eliminarEstudiante,
        actualizarEstudiante,
        buscarEstudiantePorCedula,
        usarEstudianteExistente,
        usarEstudianteMultiple,
        continuarConNuevoEstudiante,
        setEstudiantes
    } = useEstudiantes();

    const {
        evaluaciones,
        buscando: buscandoJurado,
        modalVisible: modalJuradoVisible,
        resultadoBusqueda: resultadoJurado,
        multipleModalVisible: multipleJuradoVisible,
        resultadosMultiples: resultadosMultiplesJurados,
        agregarEvaluacion,
        eliminarEvaluacion,
        actualizarEvaluacion,
        actualizarJurado,
        buscarJuradoPorCedula,
        usarJuradoExistente,
        usarJuradoMultiple,
        continuarConNuevoJurado,
        setEvaluaciones
    } = useEvaluaciones();

    // Datos principales de la tesis
    const [form, setForm] = useState({
        titulo: '',
        resumen: '',
        id_carrera: '',
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
        id_carrera?: string;
        id_year?: string;
        documento?: string;
    }>({});

    // Generar años disponibles (desde 1990 hasta el próximo año)
    const aniosDisponibles = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear + 1; i >= 1990; i--) {
            years.push({ label: i.toString(), value: i });
        }
        return years;
    }, []);

    // Cargar carreras al iniciar
    useEffect(() => {
        cargarCarreras();
    }, []);

    // Cargar datos si es edición
    useEffect(() => {
        if (isEditing && tesisId) {
            // console.log('si paso a editdm')
            cargarDatosTesis();
        }
    }, [isEditing, tesisId]);

    const cargarCarreras = async () => {
        const lista = await carrerasApi.getAll();
        // console.log('lista carreras >> ', lista)
        setCarreras(lista);
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
                    resumen: tesis.resumen || '',
                    id_carrera: tesis.id_carrera ? tesis.id_carrera.toString() : '',
                    id_year: tesis.anio_elaboracion ? tesis.anio_elaboracion.toString() : '',
                    url_documento: tesis.url_documento || ''
                });
                setSelectedCarrera(tesis.id_carrera.toString());
                console.log(tesis.id_carrera)

                setAnioElaboracion(tesis.anio_elaboracion);
                setDocumentoOriginal(tesis.url_documento);

                // Cargar estudiantes
                if (tesis.estudiantes && tesis.estudiantes.length > 0) {
                    const estudiantesCargados = tesis.estudiantes.map((est: any) => ({
                        id_estudiante: est.id_estudiante,
                        nombre_completo: est.nombre_completo,
                        cedula: est.cedula,
                        email: est.email || '',
                        esExistente: true
                    }));
                    setEstudiantes(estudiantesCargados);
                }

                // Cargar evaluaciones
                if (tesis.evaluaciones && tesis.evaluaciones.length > 0) {
                    const evaluacionesCargadas = tesis.evaluaciones.map((ev: any) => ({
                        id_evaluacion: ev.id_evaluacion,
                        nota: ev.nota.toString(),
                        fecha_evaluacion: ev.fecha_evaluacion,
                        comentarios: ev.comentarios || '',
                        jurado: {
                            id_jurado: ev.jurado.id_jurado,
                            nombre_completo: ev.jurado.nombre_completo,
                            cedula: ev.jurado.cedula,
                            titulo_profesional: ev.jurado.titulo_profesional || '',
                            esExistente: true
                        }
                    }));
                    setEvaluaciones(evaluacionesCargadas);
                }
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
        return carreras.map(c => ({
            label: c.nombre,
            value: c.id_carrera.toString()
        }));
    }, [carreras]);  // Solo se recalcula cuando carreras cambia

    // Manejar cambio de carrera
    const handleCarreraChange = useCallback((val: any) => {
        setSelectedCarrera(val);
        setForm(prev => ({ ...prev, id_carrera: val || '' }));
        // Limpiar error de carrera
        setFieldErrors(prev => ({ ...prev, id_carrera: undefined }));
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
        const tesisValidation = validateTesisForm({
            titulo: form.titulo,
            id_carrera: form.id_carrera,
            id_year: form.id_year,
            tieneDocumento: tieneDocumento
        });

        if (!tesisValidation.isValid) {
            setFieldErrors(tesisValidation.errors);
            Alert.alert('Error', 'Por favor completa los campos obligatorios');
            return;
        }

        //  Validar estudiantes
        if (estudiantes.length === 0) {
            Alert.alert('Error', 'Debe haber al menos un estudiante');
            return;
        }

        for (let i = 0; i < estudiantes.length; i++) {
            const validation = validateEstudiante(estudiantes[i], i);
            if (!validation.isValid) {
                // Mostrar el primer error del estudiante
                const errorMsg = validation.errors.nombre || validation.errors.cedula || validation.errors.email;
                Alert.alert('Error', `Estudiante ${i + 1}: ${errorMsg}`);
                return;
            }
        }

        // Validar evaluaciones 
        if (evaluaciones.length === 0) {
            Alert.alert('Error', 'Debe haber al menos una evaluación');
            return;
        }

        for (let i = 0; i < evaluaciones.length; i++) {
            const validation = validateEvaluacion(evaluaciones[i], i);
            if (!validation.isValid) {
                Alert.alert('Error', validation.errors[0]); // Muestra el primer error
                return;
            }
        }

        setLoading(true);

        const formData = new FormData();

        formData.append('titulo', form.titulo);
        formData.append('resumen', form.resumen || '');
        formData.append('id_carrera', form.id_carrera);
        formData.append('anio_elaboracion', form.id_year);

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

        const estudiantesData = estudiantes.map(est => {
            if (est.id_estudiante) {
                return { id_estudiante: est.id_estudiante,
                        nombre_completo: est.nombre_completo,
                        email: est.email || undefined
                    };
            } else {
                return {
                    nombre_completo: est.nombre_completo,
                    cedula: est.cedula,
                    email: est.email || undefined
                };
            }
        });
        formData.append('estudiantes', JSON.stringify(estudiantesData));

        const evaluacionesData = evaluaciones.map(ev => {
            let jurado: any;
            if (ev.jurado.id_jurado) {
                jurado = { id_jurado: ev.jurado.id_jurado,
                    nombre_completo: ev.jurado.nombre_completo,
                    titulo_profesional: ev.jurado.titulo_profesional || undefined 
                };
            } else {
                jurado = {
                    nombre_completo: ev.jurado.nombre_completo,
                    cedula: ev.jurado.cedula,
                    titulo_profesional: ev.jurado.titulo_profesional || undefined
                };
            }
            return {
                id_evaluacion: ev.id_evaluacion, 
                nota: parseFloat(ev.nota),
                fecha_evaluacion: ev.fecha_evaluacion,
                comentarios: ev.comentarios || undefined,
                jurado
            };
        });
        formData.append('evaluaciones', JSON.stringify(evaluacionesData));

        console.log(evaluacionesData)
        let resultado;
        if (isEditing) {
            resultado = await tesisApi.actualizar(Number(tesisId), formData);
            console.log('actualizar', resultado)

        } else {
            resultado = await tesisApi.crear(formData);
        }
        setLoading(false);

        if (resultado.success) {
            Alert.alert('Éxito', resultado.message, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
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
                                {isEditing ? 'Editar proyecto' : 'Crear proyecto'}
                            </Text>
                            <Text className="text-sky-400 text-sm">
                                {isEditing ? 'Modifica los datos del proyecto' : 'Completa todos los campos'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Formulario */}
                <View className="p-5">
                    {/* ==================== DATOS BÁSICOS ==================== */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <View className="bg-cyan-200 rounded-full w-6 h-6 items-center justify-center mr-2">
                                <Text className="text-black text-xs font-bold">1</Text>
                            </View>
                            <Text className="text-black text-lg font-bold">Datos Básicos</Text>
                        </View>

                        <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <Text className="text-base font-semibold text-gray-700 mb-2">
                                Título *
                            </Text>
                            <TextInput
                                className={`bg-white border rounded-lg p-3 text-base mb-4 ${fieldErrors.titulo ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                value={form.titulo}
                                onChangeText={(text) => handleChange('titulo', text)}
                                placeholder="Ingrese el título de la tesis"
                                placeholderTextColor="#999"
                            />
                            {fieldErrors.titulo && (
                                <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.titulo}</Text>
                            )}

                            <Text className="text-base font-semibold text-gray-700 mb-2">
                                Resumen
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded-lg p-3 text-base mb-4 min-h-[100px]"
                                value={form.resumen}
                                onChangeText={(text) => handleChange('resumen', text)}
                                placeholder="Breve descripción de la tesis"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                            <Text className="text-base font-semibold text-gray-700 mb-2">
                                Carrera *
                            </Text>
                            <View className={`mb-4 z-10 ${fieldErrors.id_carrera ? 'border-red-500 border rounded-lg' : ''}`}>
                                <DropDownPicker
                                    open={open}
                                    value={selectedCarrera}
                                    items={dropdownItems}
                                    setOpen={setOpen}
                                    setValue={setSelectedCarrera}
                                    placeholder="Selecciona una carrera"
                                    searchable={true}
                                    searchPlaceholder="Buscar carrera..."
                                    listMode="MODAL"
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderColor: fieldErrors.id_carrera ? '#EF4444' : '#D1D5DB',
                                        borderRadius: 8,
                                    }}
                                    dropDownContainerStyle={{
                                        backgroundColor: '#FFFFFF',
                                        borderColor: '#D1D5DB',
                                    }}
                                    onChangeValue={handleCarreraChange}
                                />
                            </View>
                            {fieldErrors.id_carrera && (
                                <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.id_carrera}</Text>
                            )}

                            {/* ==================== AÑO DE ELABORACIÓN ==================== */}
                            <Text className="text-base font-semibold text-gray-700 mb-2">
                                Año de Elaboración <Text className="text-red-500">*</Text>
                            </Text>
                            <View className={`mb-4 z-10`}>
                                <DropDownPicker
                                    open={openAnio}
                                    value={anioElaboracion}
                                    items={aniosDisponibles}
                                    setOpen={setOpenAnio}
                                    setValue={setAnioElaboracion}
                                    placeholder="Selecciona el año de elaboración"
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

                    {/* ==================== ESTUDIANTES ==================== */}
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <View className="bg-cyan-200 rounded-full w-6 h-6 items-center justify-center mr-2">
                                    <Text className="text-black text-xs font-bold">2</Text>
                                </View>
                                <Text className="text-black text-lg font-bold">Estudiantes</Text>
                            </View>
                            <TouchableOpacity
                                className="bg-cyan-200 px-4 py-2 rounded-lg flex-row items-center"
                                onPress={agregarEstudiante}
                            >
                                <Ionicons name="add" size={18} color="#000000" />
                                <Text className="text-black font-bold ml-1">Agregar</Text>
                            </TouchableOpacity>
                        </View>

                        {estudiantes.length === 0 ? (
                            <View className="bg-gray-50 rounded-xl p-8 items-center border border-gray-200 border-dashed">
                                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 text-center mt-3">
                                    No hay estudiantes agregados
                                </Text>
                                <Text className="text-gray-400 text-sm text-center">
                                    Presiona "Agregar" para añadir autores
                                </Text>
                            </View>
                        ) : (
                            estudiantes.map((estudiante, idx) => (
                                <EstudianteForm
                                    key={idx}
                                    index={idx}
                                    estudiante={estudiante}
                                    onUpdate={actualizarEstudiante}
                                    onDelete={eliminarEstudiante}
                                    onBuscar={buscarEstudiantePorCedula}
                                />
                            ))
                        )}
                    </View>

                    {/* ==================== EVALUACIONES ==================== */}
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <View className="bg-cyan-200 rounded-full w-6 h-6 items-center justify-center mr-2">
                                    <Text className="text-black text-xs font-bold">3</Text>
                                </View>
                                <Text className="text-black text-lg font-bold">Evaluaciones</Text>
                            </View>
                            <TouchableOpacity
                                className="bg-cyan-200 px-4 py-2 rounded-lg flex-row items-center"
                                onPress={agregarEvaluacion}
                            >
                                <Ionicons name="add" size={18} color="#000000" />
                                <Text className="text-black font-bold ml-1">Agregar</Text>
                            </TouchableOpacity>
                        </View>

                        {evaluaciones.length === 0 ? (
                            <View className="bg-gray-50 rounded-xl p-8 items-center border border-gray-200 border-dashed">
                                <Ionicons name="clipboard-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 text-center mt-3">
                                    No hay evaluaciones agregadas
                                </Text>
                                <Text className="text-gray-400 text-sm text-center">
                                    Presiona "Agregar" para añadir jurados y notas
                                </Text>
                            </View>
                        ) : (
                            evaluaciones.map((evaluacion, idx) => (
                                <EvaluacionForm
                                    key={`eval-${idx}`}
                                    index={idx}
                                    evaluacion={evaluacion}
                                    onUpdateEvaluacion={actualizarEvaluacion}
                                    onUpdateJurado={actualizarJurado}
                                    onBuscarJurado={buscarJuradoPorCedula}
                                    onDelete={eliminarEvaluacion}
                                />
                            ))
                        )}
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
                            <Text className=" text-lg font-bold ml-2">Guardar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Modales y loading... */}

                {/* Modal para múltiples estudiantes */}
                <MultipleResultsModal
                    visible={multipleEstudianteVisible}
                    title="Seleccionar Estudiante"
                    results={resultadosMultiplesEstudiantes}
                    onSelect={usarEstudianteMultiple}
                    onCancel={continuarConNuevoEstudiante}
                />

                {/* Modal para múltiples jurados */}
                <MultipleResultsModal
                    visible={multipleJuradoVisible}
                    title="Seleccionar Jurado"
                    results={resultadosMultiplesJurados}
                    onSelect={usarJuradoMultiple}
                    onCancel={continuarConNuevoJurado}
                />
                <ConfirmarDatosModal
                    visible={modalEstudianteVisible}
                    titulo="Estudiante"
                    datos={resultadoEstudiante}
                    onConfirmar={usarEstudianteExistente}
                    onCancelar={continuarConNuevoEstudiante}
                />

                <ConfirmarDatosModal
                    visible={modalJuradoVisible}
                    titulo="Jurado"
                    datos={resultadoJurado}
                    onConfirmar={usarJuradoExistente}
                    onCancelar={continuarConNuevoJurado}
                />

                {(buscandoEstudiante || buscandoJurado) && (
                    <View className="absolute inset-0 bg-cyan-600/50 justify-center items-center">
                        <ActivityIndicator size="large" color="#FFD700" />
                        <Text className="text-white mt-3">Buscando...</Text>
                    </View>
                )}
            </ScrollView>
        </KeyboardAwareScrollView>
    );
}