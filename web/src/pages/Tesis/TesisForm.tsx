import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, FileText, Calendar, BookOpen, Users, ClipboardList } from 'lucide-react';
import { tesisApi } from '../../api/endpoints/tesis';
import { carrerasApi } from '../../api/endpoints/carreras';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import { EstudianteForm } from '../../components/forms/EstudianteForm';
import { EvaluacionForm } from '../../components/forms/EvaluacionForm';
import { ConfirmarDatosModal } from '../../components/modals/ConfirmarDatosModal';
import { MultipleResultsModal } from '../../components/modals/MultipleResultsModal';
import { showErrorAlert, showSuccessAlert } from '../../helpers/alerts';
import { validateEstudiante, validateEvaluacion, validateTesisForm } from '../../helpers/validations';

interface TesisFormProps {
  mode: 'create' | 'edit';
}

export function TesisForm({ mode }: TesisFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = mode === 'edit';
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  // Estados del formulario
  const [carreras, setCarreras] = useState<any[]>([]);
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [anioElaboracion, setAnioElaboracion] = useState('');
  const [form, setForm] = useState({
    titulo: '',
    resumen: '',
  });
  const [documento, setDocumento] = useState<File | null>(null);
  const [documentoOriginal, setDocumentoOriginal] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    titulo?: string;
    id_carrera?: string;
    id_year?: string;
    documento?: string;
  }>({});

  // Hooks de estudiantes y evaluaciones
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

  // Años disponibles
  const aniosDisponibles = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear + 1; i >= 1990; i--) {
      years.push({ label: i.toString(), value: i.toString() });
    }
    return years;
  }, []);

  useEffect(() => {
    cargarCarreras();
    if (isEditing && id) {
      cargarDatosTesis();
    }
  }, []);

  const cargarCarreras = async () => {
    const data = await carrerasApi.getAll();
    setCarreras(data || []);
  };

  const cargarDatosTesis = async () => {
    setLoadingData(true);
    try {
      const response = await tesisApi.getById(Number(id));
      if (response.success && response.data) {
        const tesis = response.data;
        setForm({
          titulo: tesis.titulo || '',
          resumen: tesis.resumen || '',
        });
        setSelectedCarrera(tesis.id_carrera?.toString() || '');
        setAnioElaboracion(tesis.anio_elaboracion?.toString() || '');
        setDocumentoOriginal(tesis.url_documento || '');

        if (tesis.estudiantes?.length) {
          const estudiantesCargados = tesis.estudiantes.map((est: any) => ({
            id_estudiante: est.id_estudiante,
            nombre_completo: est.nombre_completo,
            cedula: est.cedula,
            email: est.email || '',
            esExistente: true
          }));
          setEstudiantes(estudiantesCargados);
        }

        if (tesis.evaluaciones?.length) {
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
      alert('No se pudo cargar la tesis');
    } finally {
      setLoadingData(false);
    }
  };


  // Dentro del componente
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para abrir el selector de archivos
  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Función para manejar la selección del archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no puede superar los 10MB');
        return;
      }
      setDocumento(file);
      setFieldErrors(prev => ({ ...prev, documento: undefined }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos básicos
    const tieneDocumento = !!(documento || (isEditing && documentoOriginal));
    const tesisValidation = validateTesisForm({
      titulo: form.titulo,
      id_carrera: selectedCarrera,
      id_year: anioElaboracion,
      tieneDocumento: tieneDocumento
    });

    if (!tesisValidation.isValid) {
      const firstError = Object.values(tesisValidation.errors)[0];
      showErrorAlert(firstError as string);
      setFieldErrors(tesisValidation.errors);
      return;
    }

    // Validar estudiantes
    if (estudiantes.length === 0) {
      showErrorAlert('Debe haber al menos un estudiante');
      return;
    }

    for (let i = 0; i < estudiantes.length; i++) {
      const validation = validateEstudiante(estudiantes[i], i);
      if (!validation.isValid) {
        const errorMsg = validation.errors.nombre || validation.errors.cedula || validation.errors.email;
        showErrorAlert(`Estudiante ${i + 1}: ${errorMsg}`);
        return;
      }
    }

    // Validar evaluaciones
    if (evaluaciones.length === 0) {
      showErrorAlert('Debe haber al menos una evaluación');
      return;
    }

    for (let i = 0; i < evaluaciones.length; i++) {
      const validation = validateEvaluacion(evaluaciones[i], i);
      if (!validation.isValid) {
        showErrorAlert(validation.errors[0]);
        return;
      }
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('titulo', form.titulo);
    formData.append('resumen', form.resumen || '');
    formData.append('id_carrera', selectedCarrera);
    formData.append('anio_elaboracion', anioElaboracion);

    if (documento) {
      formData.append('archivo_pdf', documento);
    } else if (isEditing && documentoOriginal) {
      formData.append('mantener_documento', 'true');
      formData.append('url_documento_original', documentoOriginal);
    }

    // Estudiantes
    const estudiantesData = estudiantes.map(est => {
      if (est.id_estudiante) {
        return {
          id_estudiante: est.id_estudiante,
          nombre_completo: est.nombre_completo,
          email: est.email || undefined
        };
      }
      return {
        nombre_completo: est.nombre_completo,
        cedula: est.cedula,
        email: est.email || undefined
      };
    });

    console.log('estudiantesData>>>', estudiantesData)
    formData.append('estudiantes', JSON.stringify(estudiantesData));

    // Evaluaciones
    const evaluacionesData = evaluaciones.map(ev => {
      let jurado: any;
      if (ev.jurado.id_jurado) {
        jurado = {
          id_jurado: ev.jurado.id_jurado,
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
    console.log('evaluaciones>>>', evaluaciones)

    formData.append('evaluaciones', JSON.stringify(evaluacionesData));

    let resultado;
    if (isEditing && id) {
      resultado = await tesisApi.actualizar(Number(id), formData);
    } else {
      resultado = await tesisApi.crear(formData);
    }

    setLoading(false);

    if (resultado.success) {
      showSuccessAlert( resultado.message, () => navigate('/proyecto')
      );
    } else {
      console.log(resultado)
      showErrorAlert(resultado.message || 'Error al guardar la tesis');
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 ml-3">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/proyecto')}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Proyecto' : 'Crear Proyecto'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEditing ? 'Modifica los datos del proyecto' : 'Completa todos los campos'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Básicos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
              <span className="text-cyan-600 font-bold text-sm">1</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Datos Básicos</h2>
          </div>

          {/* Título */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${fieldErrors.titulo ? 'border-red-500' : 'border-gray-300'
                }`}
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ingrese el título del proyecto"
            />
            {fieldErrors.titulo && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.titulo}</p>
            )}
          </div>

          {/* Resumen */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Resumen
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.resumen}
              onChange={(e) => setForm({ ...form, resumen: e.target.value })}
              placeholder="Breve descripción del proyecto"
            />
          </div>

          {/* Carrera */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Carrera *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className={`w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 ${fieldErrors.id_carrera ? 'border-red-500' : 'border-gray-300'
                  }`}
                value={selectedCarrera}
                onChange={(e) => setSelectedCarrera(e.target.value)}
              >
                <option value="">Selecciona una carrera</option>
                {carreras.map((c) => (
                  <option key={c.id_carrera} value={c.id_carrera}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.id_carrera && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.id_carrera}</p>
            )}
          </div>

          {/* Año */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Año de Elaboración *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className={`w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 ${fieldErrors.id_year ? 'border-red-500' : 'border-gray-300'
                  }`}
                value={anioElaboracion}
                onChange={(e) => setAnioElaboracion(e.target.value)}
              >
                <option value="">Selecciona un año</option>
                {aniosDisponibles.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.id_year && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.id_year}</p>
            )}
          </div>

          {/* Documento PDF */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Documento PDF
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 
            text-center hover:border-cyan-500 transition cursor-pointer"
              onClick={handleOpenFileSelector}>
              {documento ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center  gap-2">
                    <FileText className="h-8 w-8 text-green-600" />
                    <span className="text-sm text-gray-600">{documento.name}</span>
                    <span className="text-xs text-gray-400">
                      ({(documento.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocumento(null);
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              ) : documentoOriginal ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Documento actual: {documentoOriginal.split('/').pop()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-cyan-600 hover:text-cyan-700"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Haz clic para seleccionar un archivo PDF</p>
                  <p className="text-gray-400 text-sm mt-1">PDF hasta 10MB</p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Estudiantes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                <span className="text-cyan-600 font-bold text-sm">2</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Estudiantes</h2>
            </div>
            <button
              type="button"
              onClick={agregarEstudiante}
              className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-200 transition"
            >
              + Agregar
            </button>
          </div>

          {estudiantes.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No hay estudiantes agregados</p>
            </div>
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
        </div>

        {/* Evaluaciones */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                <span className="text-cyan-600 font-bold text-sm">3</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Evaluaciones</h2>
            </div>
            <button
              type="button"
              onClick={agregarEvaluacion}
              className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-200 transition"
            >
              + Agregar
            </button>
          </div>

          {evaluaciones.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No hay evaluaciones agregadas</p>
            </div>
          ) : (
            evaluaciones.map((evaluacion, idx) => (
              <EvaluacionForm
                key={idx}
                index={idx}
                evaluacion={evaluacion}
                onUpdateEvaluacion={actualizarEvaluacion}
                onUpdateJurado={actualizarJurado}
                onBuscarJurado={buscarJuradoPorCedula}
                onDelete={eliminarEvaluacion}
              />
            ))
          )}
        </div>

        {/* Botón Enviar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isEditing ? 'Actualizar Proyecto' : 'Registrar Proyecto'}
          </button>
        </div>
      </form>

      {/* Modales */}
      <ConfirmarDatosModal
        visible={modalEstudianteVisible}
        titulo="Estudiante encontrado"
        datos={resultadoEstudiante}
        onConfirmar={usarEstudianteExistente}
        onCancelar={continuarConNuevoEstudiante}
      />

      <ConfirmarDatosModal
        visible={modalJuradoVisible}
        titulo="Jurado encontrado"
        datos={resultadoJurado}
        onConfirmar={usarJuradoExistente}
        onCancelar={continuarConNuevoJurado}
      />

      <MultipleResultsModal
        visible={multipleEstudianteVisible}
        title="Seleccionar Estudiante"
        results={resultadosMultiplesEstudiantes}
        onSelect={usarEstudianteMultiple}
        onCancel={continuarConNuevoEstudiante}
      />

      <MultipleResultsModal
        visible={multipleJuradoVisible}
        title="Seleccionar Jurado"
        results={resultadosMultiplesJurados}
        onSelect={usarJuradoMultiple}
        onCancel={continuarConNuevoJurado}
      />
    </div>
  );
}