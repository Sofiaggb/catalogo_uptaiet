// // app/tesis/crear.tsx
// import { validateEstudiante, validateEvaluacion, validateTesisForm } from '@/app/helpers/validations';
// import { EstudianteForm } from '@/components/forms/EstudianteForm';
// import { EvaluacionForm } from '@/components/forms/EvaluacionForm';
// import { ConfirmarDatosModal } from '@/components/ui/ConfirmarDatosModal';
// import { MultipleResultsModal } from '@/components/ui/multipleResultsmodal';
// import { useEstudiantes } from '@/hooks/useEstudiantes';
// import { useEvaluaciones } from '@/hooks/useEvaluaciones';
// import { Ionicons } from '@expo/vector-icons';
// import * as DocumentPicker from 'expo-document-picker';
// import { router } from 'expo-router';
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
// import DropDownPicker from 'react-native-dropdown-picker';
// import {crearTesis,getCarreras } from '../../services/api';

// // Interfaces locales para el estado del formulario
// interface Carrera {
//     id_carrera: number;
//     nombre: string;
// }

// interface Props {
//     mode: 'create' | 'edit';
//     tesisId?: string;
// }

// export default function CrearTesisScreen() {
//     const [loading, setLoading] = useState(false);
//     const [carreras, setCarreras] = useState<Carrera[]>([]);
//     const [cargandoCarreras, setCargandoCarreras] = useState(true);
//     const [open, setOpen] = useState(false);
//     // Hooks
//     const {
//         estudiantes,
//         buscando: buscandoEstudiante,
//         modalVisible: modalEstudianteVisible,
//         resultadoBusqueda: resultadoEstudiante,
//         multipleModalVisible: multipleEstudianteVisible,
//         resultadosMultiples: resultadosMultiplesEstudiantes,
//         agregarEstudiante,
//         eliminarEstudiante,
//         actualizarEstudiante,
//         buscarEstudiantePorCedula,
//         usarEstudianteExistente,
//         usarEstudianteMultiple,
//         continuarConNuevoEstudiante,
//     } = useEstudiantes();

//     const {
//         evaluaciones,
//         buscando: buscandoJurado,
//         modalVisible: modalJuradoVisible,
//         resultadoBusqueda: resultadoJurado,

//         multipleModalVisible: multipleJuradoVisible,
//         resultadosMultiples: resultadosMultiplesJurados,
//         agregarEvaluacion,
//         eliminarEvaluacion,
//         actualizarEvaluacion,
//         actualizarJurado,
//         buscarJuradoPorCedula,
//         usarJuradoExistente,
//         usarJuradoMultiple,
//         continuarConNuevoJurado,
//     } = useEvaluaciones();

//     // Datos principales de la tesis
//     const [form, setForm] = useState({
//         titulo: '',
//         resumen: '',
//         id_carrera: '',
//         id_year:'',
//         url_documento: ''
//     });

//     //  year de elaboracion de la tesis
//     const [anioElaboracion, setAnioElaboracion] = useState<number | null>(null);
//     const [openAnio, setOpenAnio] = useState(false);

//     // Generar años disponibles (desde 1990 hasta el próximo año)
//     const aniosDisponibles = useMemo(() => {
//         const currentYear = new Date().getFullYear();
//         const years = [];
//         for (let i = currentYear + 1; i >= 1990; i--) {
//             years.push({ label: i.toString(), value: i });
//         }
//         return years;
//     }, []);

//     const [documento, setDocumento] = useState<{
//         uri: string;
//         name: string;
//         size: number;
//         mimeType: string;
//     } | null>(null);

//     // Estados para errores visuales
//     const [fieldErrors, setFieldErrors] = useState<{
//         titulo?: string;
//         id_carrera?: string;
//         id_year?: string;
//         documento?: string;
//     }>({});

//     // Función para seleccionar archivo
//     const seleccionarDocumento = async () => {
//         try {
//             const result = await DocumentPicker.getDocumentAsync({
//                 type: ['application/pdf'],  // Solo PDF
//                 copyToCacheDirectory: true,
//             });

//             if (result.assets && result.assets[0]) {
//                 const file = result.assets[0];
//                 setDocumento({
//                     uri: file.uri,
//                     name: file.name,
//                     size: file.size || 0,
//                     mimeType: file.mimeType || 'application/pdf'
//                 });
//                 setForm({ ...form, url_documento: file.name });  // Guardar nombre
//                 console.log(' Archivo seleccionado:', file.name);
//                 // Limpiar error del documento
//                 setFieldErrors(prev => ({ ...prev, documento: undefined }));
//             }
//         } catch (error) {
//             console.error('Error seleccionando documento:', error);
//             Alert.alert('Error', 'No se pudo seleccionar el archivo');
//         }
//     };

//     // Función para limpiar el archivo seleccionado
//     const limpiarDocumento = () => {
//         setDocumento(null);
//         setForm({ ...form, url_documento: '' });
//     };



//     // Cargar carreras al iniciar
//     useEffect(() => {
//         cargarCarreras();
//     }, []);

//     const cargarCarreras = async () => {
//         setCargandoCarreras(true);
//         const lista = await getCarreras();
//         // console.log('lista carreras >> ', lista)
//         setCarreras(lista);
//         setCargandoCarreras(false);
//     };

//     // Usar useMemo para evitar recalcular items en cada render
//     const dropdownItems = useMemo(() => {
//         return carreras.map(c => ({
//             label: c.nombre,
//             value: c.id_carrera.toString()
//         }));
//     }, [carreras]);  // Solo se recalcula cuando carreras cambia

//     // Estado para el valor del dropdown
//     const [selectedCarrera, setSelectedCarrera] = useState(null);

//     // Manejar cambio de carrera
//     const handleCarreraChange = useCallback((val: any) => {
//         setSelectedCarrera(val);
//         setForm(prev => ({ ...prev, id_carrera: val || '' }));
//         // Limpiar error de carrera
//         setFieldErrors(prev => ({ ...prev, id_carrera: undefined }));
//     }, []);


//     // manejar cambio de año 
//   const handleAnioChange = useCallback((val: number | null) => {
//     console.log('Año seleccionado:', val); // Para debug
//     setAnioElaboracion(val);
//     setForm(prev => ({ ...prev, id_year:  val?.toString() || '' }));
//     // Limpiar error del año usando la misma clave que en fieldErrors
//     setFieldErrors(prev => ({ ...prev, id_year: undefined }));
// }, []);


//     // Manejar cambios en campos principales
//     const handleChange = (campo: string, valor: string) => {
//         setForm({ ...form, [campo]: valor });
//         // Limpiar error del campo cuando el usuario escribe
//         if (fieldErrors[campo as keyof typeof fieldErrors]) {
//             setFieldErrors(prev => ({ ...prev, [campo]: undefined }));
//         }
//     };


//     // ==================== ENVÍO DEL FORMULARIO ====================

//     const handleSubmit = async () => {
//         // Validaciones
//         const tesisValidation = validateTesisForm({
//             titulo: form.titulo,
//             id_carrera: form.id_carrera,
//             id_year: form.id_year,
//             documento
//         });

//         if (!tesisValidation.isValid) {
//             setFieldErrors(tesisValidation.errors);
//             Alert.alert('Error', 'Por favor completa los campos obligatorios');
//             return;
//         }

//         //  Validar estudiantes
//         if (estudiantes.length === 0) {
//             Alert.alert('Error', 'Debe haber al menos un estudiante');
//             return;
//         }

//         for (let i = 0; i < estudiantes.length; i++) {
//             const validation = validateEstudiante(estudiantes[i], i);
//             if (!validation.isValid) {
//                 // Mostrar el primer error del estudiante
//                 const errorMsg = validation.errors.nombre || validation.errors.cedula || validation.errors.email;
//                 Alert.alert('Error', `Estudiante ${i + 1}: ${errorMsg}`);
//                 return;
//             }
//         }

//         // Validar evaluaciones 
//         if (evaluaciones.length === 0) {
//             Alert.alert('Error', 'Debe haber al menos una evaluación');
//             return;
//         }

//         for (let i = 0; i < evaluaciones.length; i++) {
//             const validation = validateEvaluacion(evaluaciones[i], i);
//             if (!validation.isValid) {
//                 Alert.alert('Error', validation.errors[0]); // Muestra el primer error
//                 return;
//             }
//         }

//         setLoading(true);

//         const formData = new FormData();

//         formData.append('titulo', form.titulo);
//         formData.append('resumen', form.resumen || '');
//         formData.append('id_carrera', form.id_carrera);
//         formData.append('anio_elaboracion', form.id_year);

//         // Agregar el archivo PDF
//         if (documento) {
//             const fileInfo = {
//                 uri: documento.uri,
//                 type: documento.mimeType || 'application/pdf',
//                 name: documento.name || 'documento.pdf'
//             };
//             formData.append('archivo_pdf', fileInfo as any);
//         }

//         const estudiantesData = estudiantes.map(est => {
//             if (est.id_estudiante) {
//                 return { id_estudiante: est.id_estudiante };
//             } else {
//                 return {
//                     nombre_completo: est.nombre_completo,
//                     cedula: est.cedula,
//                     email: est.email || undefined
//                 };
//             }
//         });
//         formData.append('estudiantes', JSON.stringify(estudiantesData));

//         const evaluacionesData = evaluaciones.map(ev => {
//             let jurado: any;
//             if (ev.jurado.id_jurado) {
//                 jurado = { id_jurado: ev.jurado.id_jurado };
//             } else {
//                 jurado = {
//                     nombre_completo: ev.jurado.nombre_completo,
//                     cedula: ev.jurado.cedula,
//                     titulo_profesional: ev.jurado.titulo_profesional || undefined
//                 };
//             }
//             return {
//                 nota: parseFloat(ev.nota),
//                 fecha_evaluacion: ev.fecha_evaluacion,
//                 comentarios: ev.comentarios || undefined,
//                 jurado
//             };
//         });
//         formData.append('evaluaciones', JSON.stringify(evaluacionesData));

//         console.log(evaluacionesData)
//         const resultado = await crearTesis(formData);
//         setLoading(false);

//         if (resultado.success) {
//             Alert.alert('Éxito', 'Tesis creada correctamente', [
//                 { text: 'OK', onPress: () => router.back() }
//             ]);
//         } else {
//             Alert.alert('Error', resultado.error || 'No se pudo crear la tesis');
//         }
//     };

//     return (
//         <ScrollView className="flex-1 bg-white">
//             {/* Header con los colores de la app */}
//             <View className="bg-black pt-4 pb-6 px-5">
//                 <View className="flex-row items-center">
//                     <TouchableOpacity onPress={() => router.back()} className="mr-3">
//                         <Ionicons name="arrow-back-outline" size={28} color="#FFD700" />
//                     </TouchableOpacity>
//                     <View>
//                         <Text className="text-yellow-500 text-2xl font-bold">Crear Tesis</Text>
//                         <Text className="text-white text-sm">Completa todos los campos</Text>
//                     </View>
//                 </View>
//             </View>

//             {/* Formulario */}
//             <View className="p-5">
//                 {/* ==================== DATOS BÁSICOS ==================== */}
//                 <View className="mb-6">
//                     <View className="flex-row items-center mb-3">
//                         <View className="bg-yellow-500 rounded-full w-6 h-6 items-center justify-center mr-2">
//                             <Text className="text-black text-xs font-bold">1</Text>
//                         </View>
//                         <Text className="text-black text-lg font-bold">Datos Básicos</Text>
//                     </View>

//                     <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                         <Text className="text-base font-semibold text-gray-700 mb-2">
//                             Título *
//                         </Text>
//                         <TextInput
//                             className={`bg-white border rounded-lg p-3 text-base mb-4 ${fieldErrors.titulo ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                             value={form.titulo}
//                             onChangeText={(text) => handleChange('titulo', text)}
//                             placeholder="Ingrese el título de la tesis"
//                             placeholderTextColor="#999"
//                         />
//                         {fieldErrors.titulo && (
//                             <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.titulo}</Text>
//                         )}

//                         <Text className="text-base font-semibold text-gray-700 mb-2">
//                             Resumen
//                         </Text>
//                         <TextInput
//                             className="bg-white border border-gray-300 rounded-lg p-3 text-base mb-4 min-h-[100px]"
//                             value={form.resumen}
//                             onChangeText={(text) => handleChange('resumen', text)}
//                             placeholder="Breve descripción de la tesis"
//                             placeholderTextColor="#999"
//                             multiline
//                             numberOfLines={4}
//                             textAlignVertical="top"
//                         />

//                         <Text className="text-base font-semibold text-gray-700 mb-2">
//                             Carrera *
//                         </Text>
//                         <View className={`mb-4 z-10 ${fieldErrors.id_carrera ? 'border-red-500 border rounded-lg' : ''}`}>
//                             <DropDownPicker
//                                 open={open}
//                                 value={selectedCarrera}
//                                 items={dropdownItems}
//                                 setOpen={setOpen}
//                                 setValue={setSelectedCarrera}
//                                 placeholder="Selecciona una carrera"
//                                 searchable={true}
//                                 searchPlaceholder="🔍 Buscar carrera..."
//                                 listMode="MODAL"
//                                 style={{
//                                     backgroundColor: '#FFFFFF',
//                                     borderColor: fieldErrors.id_carrera ? '#EF4444' : '#D1D5DB',
//                                     borderRadius: 8,
//                                 }}
//                                 dropDownContainerStyle={{
//                                     backgroundColor: '#FFFFFF',
//                                     borderColor: '#D1D5DB',
//                                 }}
//                                 onChangeValue={handleCarreraChange}
//                             />
//                         </View>
//                         {fieldErrors.id_carrera && (
//                             <Text className="text-red-500 text-sm -mt-2 mb-2">{fieldErrors.id_carrera}</Text>
//                         )}

//                        {/* ==================== AÑO DE ELABORACIÓN ==================== */}
// <Text className="text-base font-semibold text-gray-700 mb-2">
//     Año de Elaboración <Text className="text-red-500">*</Text>
// </Text>
// <View className={`mb-4 z-10`}>
//     <DropDownPicker
//         open={openAnio}
//         value={anioElaboracion}
//         items={aniosDisponibles}
//         setOpen={setOpenAnio}
//         setValue={setAnioElaboracion}
//         placeholder="Selecciona el año de elaboración"
//         searchable={true}
//         searchPlaceholder="🔍 Buscar año..."
//         listMode="MODAL"
//         style={{
//             backgroundColor: '#FFFFFF',
//             borderColor: fieldErrors.id_year ? '#EF4444' : '#D1D5DB',
//             borderRadius: 8,
//         }}
//         dropDownContainerStyle={{
//             backgroundColor: '#FFFFFF',
//             borderColor: '#D1D5DB',
//         }}
//         onChangeValue={handleAnioChange}
//     />
//     {fieldErrors.id_year && (
//         <Text className="text-red-500 text-sm mt-1">{fieldErrors.id_year}</Text>
//     )}
// </View>


//                         {/* Documento PDF */}
//                         <Text className="text-base font-semibold text-gray-700 mb-2">
//                             Documento PDF *
//                         </Text>
//                         {documento ? (
//                             <View className="bg-green-50 border border-green-300 rounded-lg p-3 flex-row justify-between items-center">
//                                 <View className="flex-1">
//                                     <View className="flex-row items-center">
//                                         <Ionicons name="document-text" size={20} color="#059669" />
//                                         <Text className="text-green-700 font-semibold ml-2">Archivo seleccionado</Text>
//                                     </View>
//                                     <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
//                                         {documento.name}
//                                     </Text>
//                                     <Text className="text-gray-400 text-xs">
//                                         {(documento.size / 1024).toFixed(2)} KB
//                                     </Text>
//                                 </View>
//                                 <TouchableOpacity onPress={limpiarDocumento} className="ml-3">
//                                     <Ionicons name="close-circle" size={24} color="#EF4444" />
//                                 </TouchableOpacity>
//                             </View>
//                         ) : (
//                             <>
//                                 <TouchableOpacity
//                                     className={`bg-gray-50 border rounded-lg p-4 items-center border-dashed ${fieldErrors.documento ? 'border-red-500' : 'border-gray-300'
//                                         }`}
//                                     onPress={seleccionarDocumento}
//                                 >
//                                     <Ionicons name="cloud-upload-outline" size={32} color={fieldErrors.documento ? "#EF4444" : "#6B7280"} />
//                                     <Text className="text-gray-600 text-base mt-2">Seleccionar archivo PDF</Text>
//                                     <Text className="text-gray-400 text-xs mt-1">Solo archivos PDF (máx 10MB)</Text>
//                                 </TouchableOpacity>
//                                 {fieldErrors.documento && (
//                                     <Text className="text-red-500 text-sm mt-2">{fieldErrors.documento}</Text>
//                                 )}
//                             </>
//                         )}
//                     </View>
//                 </View>

//                 {/* ==================== ESTUDIANTES ==================== */}
//                 <View className="mb-6">
//                     <View className="flex-row justify-between items-center mb-3">
//                         <View className="flex-row items-center">
//                             <View className="bg-yellow-500 rounded-full w-6 h-6 items-center justify-center mr-2">
//                                 <Text className="text-black text-xs font-bold">2</Text>
//                             </View>
//                             <Text className="text-black text-lg font-bold">Estudiantes</Text>
//                         </View>
//                         <TouchableOpacity
//                             className="bg-yellow-500 px-4 py-2 rounded-lg flex-row items-center"
//                             onPress={agregarEstudiante}
//                         >
//                             <Ionicons name="add" size={18} color="#000000" />
//                             <Text className="text-black font-bold ml-1">Agregar</Text>
//                         </TouchableOpacity>
//                     </View>

//                     {estudiantes.length === 0 ? (
//                         <View className="bg-gray-50 rounded-xl p-8 items-center border border-gray-200 border-dashed">
//                             <Ionicons name="people-outline" size={48} color="#9CA3AF" />
//                             <Text className="text-gray-500 text-center mt-3">
//                                 No hay estudiantes agregados
//                             </Text>
//                             <Text className="text-gray-400 text-sm text-center">
//                                 Presiona "Agregar" para añadir autores
//                             </Text>
//                         </View>
//                     ) : (
//                         estudiantes.map((estudiante, idx) => (
//                             <EstudianteForm
//                                 key={idx}
//                                 index={idx}
//                                 estudiante={estudiante}
//                                 onUpdate={actualizarEstudiante}
//                                 onDelete={eliminarEstudiante}
//                                 onBuscar={buscarEstudiantePorCedula}
//                             />
//                         ))
//                     )}
//                 </View>

//                 {/* ==================== EVALUACIONES ==================== */}
//                 <View className="mb-6">
//                     <View className="flex-row justify-between items-center mb-3">
//                         <View className="flex-row items-center">
//                             <View className="bg-yellow-500 rounded-full w-6 h-6 items-center justify-center mr-2">
//                                 <Text className="text-black text-xs font-bold">3</Text>
//                             </View>
//                             <Text className="text-black text-lg font-bold">Evaluaciones</Text>
//                         </View>
//                         <TouchableOpacity
//                             className="bg-yellow-500 px-4 py-2 rounded-lg flex-row items-center"
//                             onPress={agregarEvaluacion}
//                         >
//                             <Ionicons name="add" size={18} color="#000000" />
//                             <Text className="text-black font-bold ml-1">Agregar</Text>
//                         </TouchableOpacity>
//                     </View>

//                     {evaluaciones.length === 0 ? (
//                         <View className="bg-gray-50 rounded-xl p-8 items-center border border-gray-200 border-dashed">
//                             <Ionicons name="clipboard-outline" size={48} color="#9CA3AF" />
//                             <Text className="text-gray-500 text-center mt-3">
//                                 No hay evaluaciones agregadas
//                             </Text>
//                             <Text className="text-gray-400 text-sm text-center">
//                                 Presiona "Agregar" para añadir jurados y notas
//                             </Text>
//                         </View>
//                     ) : (
//                         evaluaciones.map((evaluacion, idx) => (
//                             <EvaluacionForm
//                                 key={`eval-${idx}`}
//                                 index={idx}
//                                 evaluacion={evaluacion}
//                                 onUpdateEvaluacion={actualizarEvaluacion}
//                                 onUpdateJurado={actualizarJurado}
//                                 onBuscarJurado={buscarJuradoPorCedula}
//                                 onDelete={eliminarEvaluacion}
//                             />
//                         ))
//                     )}
//                 </View>

//                 {/* Botón Enviar */}
//                 <TouchableOpacity
//                     className="bg-yellow-500 py-4 rounded-xl items-center mt-4 mb-10 flex-row justify-center"
//                     onPress={handleSubmit}
//                     disabled={loading}
//                 >
//                     {loading ? (
//                         <ActivityIndicator color="#000000" />
//                     ) : (
//                         <>
//                             <Ionicons name="checkmark-circle" size={24} color="#000000" />
//                             <Text className="text-black text-lg font-bold ml-2">Crear Tesis</Text>
//                         </>
//                     )}
//                 </TouchableOpacity>
//             </View>

//             {/* Modales y loading... */}

//             {/* Modal para múltiples estudiantes */}
//             <MultipleResultsModal
//                 visible={multipleEstudianteVisible}
//                 title="Seleccionar Estudiante"
//                 results={resultadosMultiplesEstudiantes}
//                 onSelect={usarEstudianteMultiple}
//                 onCancel={continuarConNuevoEstudiante}
//             />

//             {/* Modal para múltiples jurados */}
//             <MultipleResultsModal
//                 visible={multipleJuradoVisible}
//                 title="Seleccionar Jurado"
//                 results={resultadosMultiplesJurados}
//                 onSelect={usarJuradoMultiple}
//                 onCancel={continuarConNuevoJurado}
//             />
//             <ConfirmarDatosModal
//                 visible={modalEstudianteVisible}
//                 titulo="Estudiante"
//                 datos={resultadoEstudiante}
//                 onConfirmar={usarEstudianteExistente}
//                 onCancelar={continuarConNuevoEstudiante}
//             />

//             <ConfirmarDatosModal
//                 visible={modalJuradoVisible}
//                 titulo="Jurado"
//                 datos={resultadoJurado}
//                 onConfirmar={usarJuradoExistente}
//                 onCancelar={continuarConNuevoJurado}
//             />

//             {(buscandoEstudiante || buscandoJurado) && (
//                 <View className="absolute inset-0 bg-black/50 justify-center items-center">
//                     <ActivityIndicator size="large" color="#FFD700" />
//                     <Text className="text-white mt-3">Buscando...</Text>
//                 </View>
//             )}
//         </ScrollView>

//     );
// }

// app/tesis/create.tsx
import TesisForm from './form';

export default function CreateTesisScreen() {
    return <TesisForm />;
}