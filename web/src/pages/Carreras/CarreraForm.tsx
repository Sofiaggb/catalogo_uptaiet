import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, GraduationCap, BookOpen, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { carrerasApi } from '../../api/endpoints/carreras';
import { showSuccessAlert, showErrorAlert } from '../../helpers/alerts';

interface TipoCarrera {
  id_tipo_carrera: number;
  nombre: string;
}

interface TipoTrabajo {
  id_tipo_trabajo: number;
  nombre: string;
}

export function CarreraForm({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = mode === 'edit';
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  
  const [tiposCarrera, setTiposCarrera] = useState<TipoCarrera[]>([]);
  const [tiposTrabajo, setTiposTrabajo] = useState<TipoTrabajo[]>([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedTipoTrabajo, setSelectedTipoTrabajo] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
  });
  const [errors, setErrors] = useState({
    nombre: '',
    tipo: '',
  });

  useEffect(() => {
    cargarTipos();
    if (isEditing && id) {
      cargarCarrera();
    }
  }, []);

  const cargarTipos = async () => {
    const tipos = await carrerasApi.getTipos();
    setTiposCarrera(tipos);
  };

  const cargarCarrera = async () => {
    const data = await carrerasApi.getById(Number(id));
    if (data) {
      setForm({
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
      });
      setSelectedTipo(data.id_tipo_carrera?.toString() || '');
      setSelectedTipoTrabajo(data.id_tipo_trabajo?.toString() || '');
      
      // Cargar tipos de trabajo según la carrera
      if (data.id_tipo_carrera) {
        const tiposTrabajoData = await carrerasApi.getTiposTrabajoByCarrera(data.id_carrera);
        setTiposTrabajo(tiposTrabajoData);
      }
    }
    setLoadingData(false);
  };

  const handleTipoChange = async (value: string) => {
    setSelectedTipo(value);
    if (value) {
      const tiposTrabajoData = await carrerasApi.getTiposTrabajoByCarrera(Number(value));
      setTiposTrabajo(tiposTrabajoData);
      setSelectedTipoTrabajo('');
    } else {
      setTiposTrabajo([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nombre.trim()) {
      setErrors(prev => ({ ...prev, nombre: 'El nombre es obligatorio' }));
      return;
    }
    if (!selectedTipo) {
      setErrors(prev => ({ ...prev, tipo: 'Selecciona un tipo de carrera' }));
      return;
    }
    
    setLoading(true);
    
    const data = {
      nombre: form.nombre,
      descripcion: form.descripcion || undefined,
      id_tipo_carrera: parseInt(selectedTipo),
      id_tipo_trabajo: selectedTipoTrabajo ? parseInt(selectedTipoTrabajo) : undefined
    };
    
    let result;
    if (isEditing && id) {
      result = await carrerasApi.update(Number(id), data);
    } else {
      result = await carrerasApi.create(data);
    }
    
    setLoading(false);
    
    if (result.success) {
      showSuccessAlert(
        isEditing ? 'Carrera actualizada' : 'Carrera creada',
        () => navigate('/carreras')
      );
    } else {
      showErrorAlert(result.message || 'Error al guardar');
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 ml-3">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/carreras')}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Carrera' : 'Crear Carrera'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEditing ? 'Modifica los datos de la carrera' : 'Completa los datos de la nueva carrera'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre de la carrera *
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              value={form.nombre}
              onChange={(e) => {
                setForm({ ...form, nombre: e.target.value });
                setErrors(prev => ({ ...prev, nombre: '' }));
              }}
              placeholder="Ej: Ingeniería Informática"
            />
          </div>
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>

        {/* Tipo de carrera */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tipo de carrera *
          </label>
          <select
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              errors.tipo ? 'border-red-500' : 'border-gray-300'
            }`}
            value={selectedTipo}
            onChange={(e) => handleTipoChange(e.target.value)}
          >
            <option value="">Selecciona un tipo</option>
            {tiposCarrera.map((tipo) => (
              <option key={tipo.id_tipo_carrera} value={tipo.id_tipo_carrera}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
        </div>

        {/* Tipo de trabajo de grado */}
        {tiposTrabajo.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tipo de trabajo de grado
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={selectedTipoTrabajo}
                onChange={(e) => setSelectedTipoTrabajo(e.target.value)}
              >
                <option value="">No especificado</option>
                {tiposTrabajo.map((tipo) => (
                  <option key={tipo.id_tipo_trabajo} value={tipo.id_tipo_trabajo}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Modalidad de trabajo de grado sugerida para esta carrera
            </p>
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Descripción de la carrera"
          />
        </div>

        {/* Botón submit */}
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
            {isEditing ? 'Actualizar Carrera' : 'Crear Carrera'}
          </button>
        </div>
      </form>
    </div>
  );
}