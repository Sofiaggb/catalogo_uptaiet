import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen} from 'lucide-react';
import { materiasApi } from '../../api/endpoints/materias';
import { showSuccessAlert, showErrorAlert } from '../../helpers/alerts';


export function MateriaForm({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = mode === 'edit';
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  
  const [form, setForm] = useState({
    nombre: '',
  });
  
  const [errors, setErrors] = useState({
    nombre: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      cargarMateria();
    }
  }, []);

  const cargarMateria = async () => {
    const data = await materiasApi.getById(Number(id));
    if (data) {
      setForm({
        nombre: data.nombre || ''
      });
    }
    setLoadingData(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nombre.trim()) {
      setErrors(prev => ({ ...prev, nombre: 'El nombre es obligatorio' }));
      return;
    }

    setLoading(true);
    
    const data = {
      nombre: form.nombre
    };
    
    let result;
    if (isEditing && id) {
      result = await materiasApi.update(Number(id), data);
    } else {
      result = await materiasApi.create(data);
    }
    
    setLoading(false);
    
    if (result.success) {
      showSuccessAlert(
        isEditing ? 'Materia actualizada' : 'Materia creada',
        () => navigate('/materias')
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
    <div className="max-w-2xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/materias')}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Materia' : 'Registrar Materia'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEditing ? 'Modifica los datos de la materia' : 'Completa los datos de la nueva materia'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre de la materia *
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              placeholder="Ej: Programación I"
            />
          </div>
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>


        {/* Botón submit */}
        <div className="flex justify-end pt-4">
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
            {isEditing ? 'Actualizar Materia' : 'Crear Materia'}
          </button>
        </div>
      </form>
    </div>
  );
}