import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Edit, Star, Calendar,
  User, Users, BookOpen, Award, FileText, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { tesisApi } from '../../api/endpoints/tesis';
import type { Tesis } from '../../api/types';

export function TesisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [tesis, setTesis] = useState<Tesis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'evaluaciones' | 'estudiantes'>('info');

  useEffect(() => {
    cargarTesis();
  }, [id]);

  const cargarTesis = async () => {
    setLoading(true);
    try {
      const response = await tesisApi.getById(Number(id));
      // console.log('data proyecto>>>',response)
      if (response.success && response.data) {
        setTesis(response.data);
      }
    } catch (error) {
      console.error('Error cargando tesis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (tesis?.url_documento) {
      //   URL completa del backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const BASE_URL = API_URL.replace('/api', '');
      const fileUrl = `${BASE_URL}${tesis.url_documento}`;

      window.open(fileUrl, '_blank');
    }
  };

  const handleEdit = () => {
    navigate(`/proyecto/edit/${id}`);
  };


  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'aprobada': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle };
      case 'rechazada': return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle };
      case 'en_revision': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText };
    }
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 18) return 'text-green-600';
    if (nota >= 15) return 'text-blue-600';
    if (nota >= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 ml-3">Cargando proyecto...</p>
      </div>
    );
  }

  if (!tesis) {
    return (
      <div className="text-center py-20">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">Tesis no encontrada</h2>
        <p className="text-gray-500 mt-2">La tesis que buscas no existe o ha sido eliminada</p>
        <Link to="/proyecto" className="inline-block mt-6 text-cyan-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const estadoColor = getEstadoColor(tesis.nombre_estado);
  const EstadoIcon = estadoColor.icon;

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Header con breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/proyecto" className="hover:text-cyan-600">Proyecto</Link>
          <span>/</span>
          <span className="text-gray-700">{tesis.titulo.substring(0, 50)}...</span>
        </div>

        <div className="flex justify-between items-start flex-wrap gap-4">
          <button
            onClick={() => navigate('/proyecto')}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>

          {/* Acciones */}
          {isAuthenticated && [3, 4].includes(user?.id_rol) && (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-linear-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className={`flex items-center gap-1 ${estadoColor.bg} ${estadoColor.text} px-3 py-1 rounded-full text-sm font-semibold`}>
                <EstadoIcon className="h-4 w-4" />
                {tesis.nombre_estado || 'Estado'}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {tesis.anio_elaboracion}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {tesis.nombre_carrera}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{tesis.titulo}</h1>

            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{new Date(tesis.fecha_creacion).toLocaleDateString()}</span>
              </div>
              {tesis.promedio_nota && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-semibold">{tesis.promedio_nota}/20</span>
                </div>
              )}
            </div>
          </div>

          {/* Botón de descarga */}
          {tesis.url_documento && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-white text-cyan-700 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
            >
              <Download className="h-5 w-5" />
              Descargar PDF
            </button>
          )}
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-1 font-medium transition ${activeTab === 'info'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab('evaluaciones')}
            className={`pb-3 px-1 font-medium transition flex items-center gap-2 ${activeTab === 'evaluaciones'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Star className="h-4 w-4" />
            Evaluaciones ({tesis.evaluaciones?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('estudiantes')}
            className={`pb-3 px-1 font-medium transition flex items-center gap-2 ${activeTab === 'estudiantes'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Users className="h-4 w-4" />
            Estudiantes ({tesis.estudiantes?.length || 0})
          </button>
        </nav>
      </div>

      {/* Contenido según tab activo */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tab: Información */}
        {activeTab === 'info' && (
          <div className="p-6">
            {/* Resumen */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-600" />
                Resumen
              </h2>
              <div className="bg-gray-50 rounded-lg p-5">
                <p className="text-gray-700 leading-relaxed">
                  {tesis.resumen || 'No hay resumen disponible para esta tesis.'}
                </p>
              </div>
            </div>

            {/* Datos adicionales */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-cyan-600" />
                  Información general
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Carrera</span>
                    <span className="text-gray-700">{tesis.nombre_carrera}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Tipo de trabajo</span>
                    <span className=" text-gray-700">{tesis.tipo_trabajo}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Año de elaboración</span>
                    <span className="text-gray-700">{tesis.anio_elaboracion}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Fecha de registro</span>
                    <span className="text-gray-700">{new Date(tesis.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-cyan-600" />
                  Calificación
                </h3>
                <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-lg p-5 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-3">
                    <span className={`text-3xl font-bold ${getNotaColor(tesis.promedio_nota)}`}>
                      {tesis.promedio_nota || 'N/A'}
                    </span>
                  </div>
                  <p className="text-gray-600">Promedio general</p>
                  {tesis.promedio_nota >= 18 && (
                    <p className="text-green-600 text-sm mt-2">¡Excelente trabajo!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Evaluaciones */}
        {activeTab === 'evaluaciones' && (
          <div className="p-6">
            {tesis.evaluaciones && tesis.evaluaciones.length > 0 ? (
              <div className="space-y-4">
                {tesis.evaluaciones.map((evaluacion) => (
                  <div key={evaluacion.id_evaluacion} className="bg-gray-50 rounded-lg p-5">
                    <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-gray-800">
                            {evaluacion.jurado.titulo_profesional} {evaluacion.jurado.nombre_completo}
                          </span>
                        </div>
                        {isAuthenticated && [2, 3, 4].includes(user?.id_rol) && (
                          <p className="text-sm text-gray-500">Cédula: {evaluacion.jurado.cedula}</p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full ${getNotaColor(evaluacion.nota)} bg-white font-bold text-lg`}>
                        {evaluacion.nota}/20
                      </div>
                    </div>

                    {evaluacion.comentarios && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-gray-600 italic">"{evaluacion.comentarios}"</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Evaluado el {new Date(evaluacion.fecha_evaluacion).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay evaluaciones registradas</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Estudiantes */}
        {activeTab === 'estudiantes' && (
          <div className="p-6">
            {tesis.estudiantes && tesis.estudiantes.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {tesis.estudiantes.map((estudiante) => (
                  <div key={estudiante.id_estudiante} className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-cyan-600" />
                    </div>
                    {isAuthenticated && [2, 3, 4].includes(user?.id_rol) && (
                      <div>
                        <h4 className="font-semibold text-gray-800">{estudiante.nombre_completo}</h4>
                        <p className="text-sm text-gray-500">Cédula: {estudiante.cedula}</p>
                        {estudiante.email && (
                          <p className="text-sm text-gray-500">Email: {estudiante.email}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay estudiantes registrados</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}