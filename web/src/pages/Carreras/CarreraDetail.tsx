import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, BookOpen, Building, Award, Users, FileText, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { carrerasApi } from '../../api/endpoints/carreras';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../../helpers/alerts';
import type { Carrera } from '../../api/types';


export function CarreraDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [carrera, setCarrera] = useState<Carrera| null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCarrera();
  }, [id]);

  const cargarCarrera = async () => {
    setLoading(true);
    const data = await carrerasApi.getById(Number(id));
    if (data) {
      setCarrera(data);
    }
    setLoading(false);
  };

  const handleEdit = () => {
    navigate(`/carreras/edit/${id}`);
  };

  const handleDelete = async () => {
    const confirmed = await showConfirmAlert(
      'Eliminar Carrera',
      `¿Estás seguro de eliminar "${carrera?.nombre}"? Esta acción no se puede deshacer.`
    );
    
    if (confirmed) {
      const success = await carrerasApi.delete(Number(id));
      if (success) {
        showSuccessAlert('Carrera eliminada correctamente', () => navigate('/carreras'));
      } else {
        showErrorAlert('Error al eliminar la carrera');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 ml-3">Cargando...</p>
      </div>
    );
  }

  if (!carrera) {
    return (
      <div className="text-center py-20">
        <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">Carrera no encontrada</h2>
        <p className="text-gray-500 mt-2">La carrera que buscas no existe o ha sido eliminada</p>
        <Link to="/carreras" className="inline-block mt-6 text-cyan-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header con breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/carreras" className="hover:text-cyan-600">Carreras</Link>
          <span>/</span>
          <span className="text-gray-700">{carrera.nombre}</span>
        </div>
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <button
            onClick={() => navigate('/carreras')}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
          
          {isAuthenticated && (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 rounded-full p-3">
            <GraduationCap className="h-8 w-8" />
          </div>
          {carrera.tipo_carrera && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {carrera.tipo_carrera}
            </span>
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{carrera.nombre}</h1>
        
     
      </div>

      {/* Información de la carrera */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Descripción */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-600" />
            Descripción
          </h2>
          <div className="bg-gray-50 rounded-lg p-5">
            <p className="text-gray-700 leading-relaxed">
              {carrera.descripcion || 'No hay descripción disponible para esta carrera.'}
            </p>
          </div>
        </div>

        {/* Tipo de trabajo de grado */}
        {carrera.tipo_trabajo && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-cyan-600" />
              Modalidad de Trabajo de Grado
            </h2>
            <div className="bg-amber-50 rounded-lg p-5 border border-amber-100">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600" />
                <p className="text-gray-700">
                  <span className="font-semibold">Tipo de trabajo recomendado:</span> {carrera.tipo_trabajo}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Building className="h-5 w-5 text-cyan-600" />
            Información adicional
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">ID de carrera</p>
              <p className="font-mono text-gray-700">{carrera.id_carrera}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Tipo</p>
              <p className="text-gray-700">{carrera.tipo_carrera || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>

   
    </div>
  );
}