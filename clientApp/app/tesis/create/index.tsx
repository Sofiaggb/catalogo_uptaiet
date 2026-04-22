// app/tesis/crear.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {
    buscarPorCedula,
    crearTesis,
    getCarreras,
    type CrearTesisInput,
    type JuradoInput
} from '../../../services/api';

// Interfaces locales para el estado del formulario
interface EstudianteForm {
    id_estudiante?: number;
    nombre_completo: string;
    cedula: string;
    email: string;
    esExistente: boolean;
}

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
const [items, setItems] = useState(
    carreras.map(c => ({ label: c.nombre, value: c.id_carrera.toString() }))
);
    // Datos principales de la tesis
    const [form, setForm] = useState({
        titulo: '',
        resumen: '',
        id_carrera: '',
        url_documento: ''
    });
    
    // Listas dinámicas
    const [estudiantes, setEstudiantes] = useState<EstudianteForm[]>([
        { nombre_completo: '', cedula: '', email: '', esExistente: false }
    ]);
    
    const [evaluaciones, setEvaluaciones] = useState<EvaluacionForm[]>([
        { 
            nota: '', 
            fecha_evaluacion: new Date().toISOString().split('T')[0], 
            comentarios: '', 
            jurado: { nombre_completo: '', cedula: '', titulo_profesional: '', esExistente: false } 
        }
    ]);
    
    // Modal de búsqueda
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState<'estudiante' | 'jurado'>('estudiante');
    const [cedulaBuscar, setCedulaBuscar] = useState('');
    const [indiceEditando, setIndiceEditando] = useState<number | null>(null);
    const [resultadoBusqueda, setResultadoBusqueda] = useState<any>(null);

    // Cargar carreras al iniciar
    useEffect(() => {
        cargarCarreras();
    }, []);

    const cargarCarreras = async () => {
        setCargandoCarreras(true);
        const lista = await getCarreras();
        console.log('lista carreras >> ',lista)
        setCarreras(lista);
        setCargandoCarreras(false);
    };

    // Manejar cambios en campos principales
    const handleChange = (campo: string, valor: string) => {
        setForm({ ...form, [campo]: valor });
    };

    // ==================== ESTUDIANTES ====================
    
    const agregarEstudiante = () => {
        setEstudiantes([
            ...estudiantes,
            { nombre_completo: '', cedula: '', email: '', esExistente: false }
        ]);
    };

    const eliminarEstudiante = (index: number) => {
        if (estudiantes.length === 1) {
            Alert.alert('Error', 'Debe haber al menos un estudiante');
            return;
        }
        const nuevos = [...estudiantes];
        nuevos.splice(index, 1);
        setEstudiantes(nuevos);
    };

    const actualizarEstudiante = (index: number, campo: keyof EstudianteForm, valor: string) => {
        const nuevos = [...estudiantes];
        nuevos[index] = { ...nuevos[index], [campo]: valor, esExistente: false };
        setEstudiantes(nuevos);
    };

    const buscarEstudiantePorCedula = async (index: number, cedula: string) => {
        if (!cedula || cedula.length < 5) return;
        
        setBuscando(true);
        setIndiceEditando(index);
        setModalTipo('estudiante');
        setCedulaBuscar(cedula);
        
        try {
            const resultado = await buscarPorCedula('estudiante', cedula);
            if (resultado.success && resultado.data) {
                setResultadoBusqueda(resultado.data);
                setModalVisible(true);
            }
        } catch (error) {
            console.error('Error buscando estudiante:', error);
        } finally {
            setBuscando(false);
        }
    };

    const usarEstudianteExistente = () => {
        if (resultadoBusqueda && indiceEditando !== null) {
            const nuevos = [...estudiantes];
            nuevos[indiceEditando] = {
                id_estudiante: resultadoBusqueda.id_estudiante,
                nombre_completo: resultadoBusqueda.nombre_completo,
                cedula: resultadoBusqueda.cedula,
                email: resultadoBusqueda.email || '',
                esExistente: true
            };
            setEstudiantes(nuevos);
        }
        setModalVisible(false);
        setResultadoBusqueda(null);
        setIndiceEditando(null);
    };

    const continuarConNuevoEstudiante = () => {
        setModalVisible(false);
        setResultadoBusqueda(null);
        setIndiceEditando(null);
    };

    // ==================== JURADOS Y EVALUACIONES ====================
    
    const agregarEvaluacion = () => {
        setEvaluaciones([
            ...evaluaciones,
            { 
                nota: '', 
                fecha_evaluacion: new Date().toISOString().split('T')[0], 
                comentarios: '', 
                jurado: { nombre_completo: '', cedula: '', titulo_profesional: '', esExistente: false } 
            }
        ]);
    };

    const eliminarEvaluacion = (index: number) => {
        if (evaluaciones.length === 1) {
            Alert.alert('Error', 'Debe haber al menos una evaluación');
            return;
        }
        const nuevos = [...evaluaciones];
        nuevos.splice(index, 1);
        setEvaluaciones(nuevos);
    };

    const actualizarEvaluacion = (index: number, campo: keyof EvaluacionForm, valor: string) => {
        const nuevos = [...evaluaciones];
        nuevos[index] = { ...nuevos[index], [campo]: valor };
        setEvaluaciones(nuevos);
    };

    const actualizarJurado = (evalIndex: number, campo: keyof JuradoForm, valor: string) => {
        const nuevos = [...evaluaciones];
        nuevos[evalIndex].jurado = { 
            ...nuevos[evalIndex].jurado, 
            [campo]: valor,
            esExistente: false 
        };
        setEvaluaciones(nuevos);
    };

    const buscarJuradoPorCedula = async (evalIndex: number, cedula: string) => {
        if (!cedula || cedula.length < 5) return;
        
        setBuscando(true);
        setIndiceEditando(evalIndex);
        setModalTipo('jurado');
        setCedulaBuscar(cedula);
        
        try {
            const resultado = await buscarPorCedula('jurado', cedula);
            if (resultado.success && resultado.data) {
                setResultadoBusqueda(resultado.data);
                setModalVisible(true);
            }
        } catch (error) {
            console.error('Error buscando jurado:', error);
        } finally {
            setBuscando(false);
        }
    };

    const usarJuradoExistente = () => {
        if (resultadoBusqueda && indiceEditando !== null) {
            const nuevos = [...evaluaciones];
            nuevos[indiceEditando].jurado = {
                id_jurado: resultadoBusqueda.id_jurado,
                nombre_completo: resultadoBusqueda.nombre_completo,
                cedula: resultadoBusqueda.cedula,
                titulo_profesional: resultadoBusqueda.titulo_profesional || '',
                esExistente: true
            };
            setEvaluaciones(nuevos);
        }
        setModalVisible(false);
        setResultadoBusqueda(null);
        setIndiceEditando(null);
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
        
        // Preparar datos para enviar (usando los tipos correctos)
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
        
        const resultado = await crearTesis(datosEnvio);
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
        <ScrollView className="flex-1 bg-gray-100 p-5">
            <Text className="text-3xl font-bold text-center text-gray-800 mb-8">
                📝 Crear Nueva Tesis
            </Text>

            {/* ==================== DATOS BÁSICOS ==================== */}
            <Text className="text-xl font-bold text-gray-800 mb-4">📋 Datos Básicos</Text>
            
            <Text className="text-base font-semibold text-gray-700 mb-2">Título *</Text>
            <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-base mb-5"
                value={form.titulo}
                onChangeText={(text) => handleChange('titulo', text)}
                placeholder="Ingrese el título de la tesis"
                placeholderTextColor="#999"
            />

            <Text className="text-base font-semibold text-gray-700 mb-2">Resumen</Text>
            <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-base mb-5 min-h-[100px]"
                value={form.resumen}
                onChangeText={(text) => handleChange('resumen', text)}
                placeholder="Breve descripción de la tesis"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            {/* ==================== SELECTOR DE CARRERA ==================== */}
<Text className="text-base font-semibold text-gray-700 mb-2">Carrera *</Text>
<DropDownPicker
    open={open}
    value={value}
    items={carreras.map(c => ({ label: c.nombre, value: c.id_carrera.toString() }))}
    setOpen={setOpen}
    setValue={setValue}
    placeholder="Selecciona una carrera"
    searchable={true}  // 👈 Activa el buscador
    searchPlaceholder="Buscar carrera..."
    listMode="MODAL"  // Mejor para pantallas pequeñas
/>





            <Text className="text-base font-semibold text-gray-700 mb-2">URL Documento (opcional)</Text>
            <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-base mb-5"
                value={form.url_documento}
                onChangeText={(text) => handleChange('url_documento', text)}
                placeholder="/uploads/tesis.pdf"
                placeholderTextColor="#999"
            />

            {/* ==================== ESTUDIANTES ==================== */}
            <View className="flex-row justify-between items-center mt-4 mb-4">
                <Text className="text-xl font-bold text-gray-800">👨‍🎓 Estudiantes</Text>
                <TouchableOpacity
                    className="bg-green-500 px-4 py-2 rounded-lg"
                    onPress={agregarEstudiante}
                >
                    <Text className="text-white font-bold">+ Agregar</Text>
                </TouchableOpacity>
            </View>

            {estudiantes.map((estudiante, idx) => (
                <View key={idx} className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="font-bold text-gray-700">Estudiante {idx + 1}</Text>
                        {estudiante.esExistente && (
                            <View className="bg-green-100 px-2 py-1 rounded">
                                <Text className="text-green-700 text-xs">✓ Existente</Text>
                            </View>
                        )}
                        <TouchableOpacity onPress={() => eliminarEstudiante(idx)}>
                            <Text className="text-red-500 font-bold">Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <Text className="text-sm font-semibold text-gray-600 mb-1">Cédula *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3"
                        value={estudiante.cedula}
                        onChangeText={(text) => actualizarEstudiante(idx, 'cedula', text)}
                        onBlur={() => buscarEstudiantePorCedula(idx, estudiante.cedula)}
                        placeholder="Cédula"
                        placeholderTextColor="#999"
                    />
                    
                    <Text className="text-sm font-semibold text-gray-600 mb-1">Nombre Completo *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3"
                        value={estudiante.nombre_completo}
                        onChangeText={(text) => actualizarEstudiante(idx, 'nombre_completo', text)}
                        placeholder="Nombre completo"
                        placeholderTextColor="#999"
                    />
                    
                    <Text className="text-sm font-semibold text-gray-600 mb-1">Email</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2"
                        value={estudiante.email}
                        onChangeText={(text) => actualizarEstudiante(idx, 'email', text)}
                        placeholder="email@universidad.edu"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                    />
                </View>
            ))}

            {/* ==================== EVALUACIONES ==================== */}
            <View className="flex-row justify-between items-center mt-4 mb-4">
                <Text className="text-xl font-bold text-gray-800">⚖️ Evaluaciones</Text>
                <TouchableOpacity
                    className="bg-green-500 px-4 py-2 rounded-lg"
                    onPress={agregarEvaluacion}
                >
                    <Text className="text-white font-bold">+ Agregar</Text>
                </TouchableOpacity>
            </View>

            {evaluaciones.map((evaluacion, idx) => (
                <View key={idx} className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="font-bold text-gray-700">Evaluación {idx + 1}</Text>
                        <TouchableOpacity onPress={() => eliminarEvaluacion(idx)}>
                            <Text className="text-red-500 font-bold">Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <Text className="text-sm font-semibold text-gray-600 mb-1">Nota *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3"
                        value={evaluacion.nota}
                        onChangeText={(text) => actualizarEvaluacion(idx, 'nota', text)}
                        placeholder="0 - 20"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                    />
                    
                    <Text className="text-sm font-semibold text-gray-600 mb-1">Fecha Evaluación</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3"
                        value={evaluacion.fecha_evaluacion}
                        onChangeText={(text) => actualizarEvaluacion(idx, 'fecha_evaluacion', text)}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#999"
                    />
                    
                    <Text className="text-sm font-semibold text-gray-600 mb-1">Comentarios</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3 min-h-[60px]"
                        value={evaluacion.comentarios}
                        onChangeText={(text) => actualizarEvaluacion(idx, 'comentarios', text)}
                        placeholder="Observaciones del jurado"
                        placeholderTextColor="#999"
                        multiline
                    />
                    
                    <Text className="text-sm font-semibold text-gray-600 mb-1 mt-2">
                        👨‍⚖️ Jurado {evaluacion.jurado.esExistente && '(Existente)'}
                    </Text>
                    
                    <Text className="text-xs text-gray-500 mb-1">Cédula *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-2"
                        value={evaluacion.jurado.cedula}
                        onChangeText={(text) => actualizarJurado(idx, 'cedula', text)}
                        onBlur={() => buscarJuradoPorCedula(idx, evaluacion.jurado.cedula)}
                        placeholder="Cédula del jurado"
                        placeholderTextColor="#999"
                    />
                    
                    <Text className="text-xs text-gray-500 mb-1">Nombre Completo *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-2"
                        value={evaluacion.jurado.nombre_completo}
                        onChangeText={(text) => actualizarJurado(idx, 'nombre_completo', text)}
                        placeholder="Nombre completo"
                        placeholderTextColor="#999"
                    />
                    
                    <Text className="text-xs text-gray-500 mb-1">Título Profesional</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2"
                        value={evaluacion.jurado.titulo_profesional}
                        onChangeText={(text) => actualizarJurado(idx, 'titulo_profesional', text)}
                        placeholder="Dr., Mg., Ing., etc."
                        placeholderTextColor="#999"
                    />
                </View>
            ))}

            {/* ==================== BOTÓN ENVIAR ==================== */}
            <TouchableOpacity
                className="bg-blue-500 py-4 rounded-lg items-center mt-4 mb-10"
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white text-lg font-bold">✅ Crear Tesis</Text>
                )}
            </TouchableOpacity>

            {/* ==================== MODAL DE CONFIRMACIÓN ==================== */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white rounded-lg p-6 w-11/12 max-w-sm">
                        <Text className="text-xl font-bold mb-4 text-center">
                            {modalTipo === 'estudiante' ? '🎓 Estudiante' : '⚖️ Jurado'} Encontrado
                        </Text>
                        
                        {resultadoBusqueda && (
                            <View className="mb-4">
                                <Text className="text-gray-700">
                                    <Text className="font-bold">Nombre:</Text> {resultadoBusqueda.nombre_completo}
                                </Text>
                                <Text className="text-gray-700 mt-1">
                                    <Text className="font-bold">Cédula:</Text> {resultadoBusqueda.cedula}
                                </Text>
                                {modalTipo === 'estudiante' && resultadoBusqueda.email && (
                                    <Text className="text-gray-700 mt-1">
                                        <Text className="font-bold">Email:</Text> {resultadoBusqueda.email}
                                    </Text>
                                )}
                                {modalTipo === 'jurado' && resultadoBusqueda.titulo_profesional && (
                                    <Text className="text-gray-700 mt-1">
                                        <Text className="font-bold">Título:</Text> {resultadoBusqueda.titulo_profesional}
                                    </Text>
                                )}
                            </View>
                        )}
                        
                        <Text className="text-gray-600 mb-4 text-center">
                            ¿Deseas usar estos datos?
                        </Text>
                        
                        <View className="flex-row justify-between gap-3">
                            <TouchableOpacity
                                className="flex-1 bg-gray-300 py-3 rounded-lg"
                                onPress={continuarConNuevoEstudiante}
                            >
                                <Text className="text-center font-bold">No, crear nuevo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-blue-500 py-3 rounded-lg"
                                onPress={modalTipo === 'estudiante' ? usarEstudianteExistente : usarJuradoExistente}
                            >
                                <Text className="text-white text-center font-bold">Sí, usar existente</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            
            {/* Indicador de búsqueda */}
            {buscando && (
                <View className="absolute inset-0 bg-black/50 justify-center items-center">
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="text-white mt-3">Buscando...</Text>
                </View>
            )}
        </ScrollView>
    );
}