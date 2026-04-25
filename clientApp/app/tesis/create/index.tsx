// app/tesis/crear.tsx
import { EstudianteForm } from '@/components/forms/EstudianteForm';
import { EvaluacionForm } from '@/components/forms/EvaluacionForm';
import { ConfirmarDatosModal } from '@/components/ui/ConfirmarDatosModal';
import { useEstudiantes } from '@/hooks/useEstudiantes';
import { useEvaluaciones } from '@/hooks/useEvaluaciones';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
    crearTesis,
    getCarreras,
    type CrearTesisInput,
    type JuradoInput
} from '../../../services/api';

// Interfaces locales para el estado del formulario

interface JuradoForm {
    id_jurado?: number;
    nombre_completo: string;
    cedula: string;
    titulo_profesional: string;
    esExistente: boolean;
}

interface EvaluacionForm {
    nota: string;
    fecha_evaluacion: string;
    comentarios: string;
    jurado: JuradoForm;
}

interface Carrera {
    id_carrera: number;
    nombre: string;
}

export default function CrearTesisScreen() {
    const [loading, setLoading] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [cargandoCarreras, setCargandoCarreras] = useState(true);

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);

    // Hooks
    const {
        estudiantes,
        buscando: buscandoEstudiante,
        modalVisible: modalEstudianteVisible,
        resultadoBusqueda: resultadoEstudiante,
        agregarEstudiante,
        eliminarEstudiante,
        actualizarEstudiante,
        buscarEstudiantePorCedula,
        usarEstudianteExistente,
        continuarConNuevoEstudiante,
    } = useEstudiantes();

    const {
        evaluaciones,
        buscando: buscandoJurado,
        modalVisible: modalJuradoVisible,
        resultadoBusqueda: resultadoJurado,
        agregarEvaluacion,
        eliminarEvaluacion,
        actualizarEvaluacion,
        actualizarJurado,
        buscarJuradoPorCedula,
        usarJuradoExistente,
        continuarConNuevoJurado,
    } = useEvaluaciones();

    // Datos principales de la tesis
    const [form, setForm] = useState({
        titulo: '',
        resumen: '',
        id_carrera: '',
        url_documento: ''
    });


    const [documento, setDocumento] = useState<{
        uri: string;
        name: string;
        size: number;
        mimeType: string;
    } | null>(null);

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
            }
        } catch (error) {
            console.error('Error seleccionando documento:', error);
            Alert.alert('Error', 'No se pudo seleccionar el archivo');
        }
    };

    // Función para limpiar el archivo seleccionado
    const limpiarDocumento = () => {
        setDocumento(null);
        setForm({ ...form, url_documento: '' });
    };



    // Cargar carreras al iniciar
    useEffect(() => {
        cargarCarreras();
    }, []);

    const cargarCarreras = async () => {
        setCargandoCarreras(true);
        const lista = await getCarreras();
        // console.log('lista carreras >> ', lista)
        setCarreras(lista);
        setCargandoCarreras(false);
    };

    // Usar useMemo para evitar recalcular items en cada render
    const dropdownItems = useMemo(() => {
        return carreras.map(c => ({
            label: c.nombre,
            value: c.id_carrera.toString()
        }));
    }, [carreras]);  // Solo se recalcula cuando carreras cambia

    // Estado para el valor del dropdown
    const [selectedCarrera, setSelectedCarrera] = useState(null);

    // Manejar cambio de carrera
    const handleCarreraChange = useCallback((val: any) => {
        setSelectedCarrera(val);
        setForm(prev => ({ ...prev, id_carrera: val || '' }));
    }, []);





    // Manejar cambios en campos principales
    const handleChange = (campo: string, valor: string) => {
        setForm({ ...form, [campo]: valor });
    };


    // ==================== ENVÍO DEL FORMULARIO ====================

    const handleSubmit = async () => {
        // Validaciones básicas
        if (!form.titulo.trim()) {
            Alert.alert('Error', 'El título es obligatorio');
            return;
        }
        if (!form.id_carrera) {
            Alert.alert('Error', 'Selecciona una carrera');
            return;
        }

        // Validar estudiantes
        for (let i = 0; i < estudiantes.length; i++) {
            const est = estudiantes[i];
            if (!est.nombre_completo.trim()) {
                Alert.alert('Error', `El estudiante ${i + 1} debe tener nombre completo`);
                return;
            }
            if (!est.cedula.trim()) {
                Alert.alert('Error', `El estudiante ${i + 1} debe tener cédula`);
                return;
            }
        }

        // Validar evaluaciones
        for (let i = 0; i < evaluaciones.length; i++) {
            const ev = evaluaciones[i];
            if (!ev.nota) {
                Alert.alert('Error', `La evaluación ${i + 1} debe tener una nota`);
                return;
            }
            if (!ev.jurado.nombre_completo.trim()) {
                Alert.alert('Error', `El jurado de la evaluación ${i + 1} debe tener nombre completo`);
                return;
            }
            if (!ev.jurado.cedula.trim()) {
                Alert.alert('Error', `El jurado de la evaluación ${i + 1} debe tener cédula`);
                return;
            }
        }

        setLoading(true);

        // ver que datos se estan enviando (solo en uso pasa console log porque se envia por formdata)
        const datosEnvio: CrearTesisInput = {
            titulo: form.titulo,
            resumen: form.resumen || undefined,
            id_carrera: parseInt(form.id_carrera),
            url_documento: form.url_documento || null,
            estudiantes: estudiantes.map(est => {
                if (est.id_estudiante) {
                    // Estudiante existente: solo enviar ID
                    return { id_estudiante: est.id_estudiante };
                } else {
                    // Estudiante nuevo: enviar datos completos
                    return {
                        nombre_completo: est.nombre_completo,
                        cedula: est.cedula,
                        email: est.email || undefined
                    };
                }
            }),
            evaluaciones: evaluaciones.map(ev => {
                let jurado: JuradoInput;

                if (ev.jurado.id_jurado) {
                    // Jurado existente: solo enviar ID
                    jurado = { id_jurado: ev.jurado.id_jurado };
                } else {
                    // Jurado nuevo: enviar datos completos
                    jurado = {
                        nombre_completo: ev.jurado.nombre_completo,
                        cedula: ev.jurado.cedula,
                        titulo_profesional: ev.jurado.titulo_profesional || undefined
                    };
                }

                return {
                    nota: parseFloat(ev.nota),
                    fecha_evaluacion: ev.fecha_evaluacion,
                    comentarios: ev.comentarios || undefined,
                    jurado
                };
            })
        };

        const formData = new FormData();

        formData.append('titulo', form.titulo);
        formData.append('resumen', form.resumen || '');
        formData.append('id_carrera', form.id_carrera);
        
        // Agregar el archivo PDF
        if (documento) {
            const fileInfo = {
                uri: documento.uri,
                type: documento.mimeType || 'application/pdf',
                name: documento.name || 'documento.pdf'
            };
            formData.append('archivo_pdf', fileInfo as any);
        }
        
        const estudiantesData = estudiantes.map(est => {
            if (est.id_estudiante) {
                return { id_estudiante: est.id_estudiante };
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
                jurado = { id_jurado: ev.jurado.id_jurado };
            } else {
                jurado = {
                    nombre_completo: ev.jurado.nombre_completo,
                    cedula: ev.jurado.cedula,
                    titulo_profesional: ev.jurado.titulo_profesional || undefined
                };
            }
            return {
                nota: parseFloat(ev.nota),
                fecha_evaluacion: ev.fecha_evaluacion,
                comentarios: ev.comentarios || undefined,
                jurado
            };
        });
        formData.append('evaluaciones', JSON.stringify(evaluacionesData));
        
        console.log(evaluacionesData)
        console.log(datosEnvio)
        const resultado = await crearTesis(formData);
        setLoading(false);

        if (resultado.success) {
            Alert.alert('Éxito', 'Tesis creada correctamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Error', resultado.error || 'No se pudo crear la tesis');
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header con los colores de la app */}
            <View className="bg-black pt-16 pb-6 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back-outline" size={28} color="#FFD700" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-yellow-500 text-2xl font-bold">Crear Tesis</Text>
                        <Text className="text-white text-sm">Completa todos los campos</Text>
                    </View>
                </View>
            </View>

            {/* Formulario */}
            <View className="p-5">
                {/* ==================== DATOS BÁSICOS ==================== */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-yellow-500 rounded-full w-6 h-6 items-center justify-center mr-2">
                            <Text className="text-black text-xs font-bold">1</Text>
                        </View>
                        <Text className="text-black text-lg font-bold">Datos Básicos</Text>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <Text className="text-base font-semibold text-gray-700 mb-2">
                            Título *
                        </Text>
                        <TextInput
                            className="bg-white border border-gray-300 rounded-lg p-3 text-base mb-4"
                            value={form.titulo}
                            onChangeText={(text) => handleChange('titulo', text)}
                            placeholder="Ingrese el título de la tesis"
                            placeholderTextColor="#999"
                        />

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
                        <View className="mb-4 z-10">
                            <DropDownPicker
                                open={open}
                                value={selectedCarrera}
                                items={dropdownItems}
                                setOpen={setOpen}
                                setValue={setSelectedCarrera}
                                placeholder="Selecciona una carrera"
                                searchable={true}
                                searchPlaceholder="🔍 Buscar carrera..."
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
                                onChangeValue={handleCarreraChange}
                            />
                        </View>

                        {/* Documento PDF */}
                        <Text className="text-base font-semibold text-gray-700 mb-2">
                            Documento PDF (opcional)
                        </Text>
                        {documento ? (
                            <View className="bg-green-50 border border-green-300 rounded-lg p-3 flex-row justify-between items-center">
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Ionicons name="document-text" size={20} color="#059669" />
                                        <Text className="text-green-700 font-semibold ml-2">Archivo seleccionado</Text>
                                    </View>
                                    <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
                                        {documento.name}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        {(documento.size / 1024).toFixed(2)} KB
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={limpiarDocumento} className="ml-3">
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                className="bg-gray-50 border border-gray-300 rounded-lg p-4 items-center border-dashed"
                                onPress={seleccionarDocumento}
                            >
                                <Ionicons name="cloud-upload-outline" size={32} color="#6B7280" />
                                <Text className="text-gray-600 text-base mt-2">Seleccionar archivo PDF</Text>
                                <Text className="text-gray-400 text-xs mt-1">Solo archivos PDF (máx 10MB)</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ==================== ESTUDIANTES ==================== */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row items-center">
                            <View className="bg-yellow-500 rounded-full w-6 h-6 items-center justify-center mr-2">
                                <Text className="text-black text-xs font-bold">2</Text>
                            </View>
                            <Text className="text-black text-lg font-bold">Estudiantes</Text>
                        </View>
                        <TouchableOpacity
                            className="bg-yellow-500 px-4 py-2 rounded-lg flex-row items-center"
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
                            <View className="bg-yellow-500 rounded-full w-6 h-6 items-center justify-center mr-2">
                                <Text className="text-black text-xs font-bold">3</Text>
                            </View>
                            <Text className="text-black text-lg font-bold">Evaluaciones</Text>
                        </View>
                        <TouchableOpacity
                            className="bg-yellow-500 px-4 py-2 rounded-lg flex-row items-center"
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
                    className="bg-yellow-500 py-4 rounded-xl items-center mt-4 mb-10 flex-row justify-center"
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000000" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color="#000000" />
                            <Text className="text-black text-lg font-bold ml-2">Crear Tesis</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modales y loading... */}
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
                <View className="absolute inset-0 bg-black/50 justify-center items-center">
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text className="text-white mt-3">Buscando...</Text>
                </View>
            )}
        </ScrollView>
      
    );
}