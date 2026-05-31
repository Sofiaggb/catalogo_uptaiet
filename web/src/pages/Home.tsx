import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {   BookOpen, FileText, Library, GraduationCap, User, LogIn, Award, ChevronRight, Calendar, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { tesisApi } from '../api/endpoints/tesis';
import { carrerasApi } from '../api/endpoints/carreras';
import { librosApi } from '../api/endpoints/libros';
import type { Carrera, Tesis } from '../api/types';

export function Home() {
  const { isAuthenticated,user } = useAuth();
  const [stats, setStats] = useState({
    tesis: 0,
    libros: 0,
    carreras: 0
  });
  const [tesisDestacadas, setTesisDestacadas] = useState<Tesis[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar estadísticas
      const [tesisResult, librosResult, carrerasResult] = await Promise.all([
        tesisApi.listar({ limit: 1 }),
        librosApi.getAll({ limit: 1 }),
        carrerasApi.getAll()
      ]);

      setStats({
        tesis: tesisResult.pagination?.total || 0,
        libros: librosResult.pagination?.total || 0,
        carreras: carrerasResult.length || 0
      });

      // Cargar tesis destacadas (últimas 3)
      const tesisDestacadasResult = await tesisApi.listar({ limit: 3, page: 1 });
      if (tesisDestacadasResult.success) {
        setTesisDestacadas(tesisDestacadasResult.data);
      }

      // Cargar carreras para categorías
      setCarreras(carrerasResult);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas a mostrar
  const statsCards = [
    { label: 'Proyectos Publicadas', value: stats.tesis, icon: FileText, color: 'bg-blue-500' },
    { label: 'Libros Digitales', value: stats.libros, icon: Library, color: 'bg-green-500' },
    { label: 'Carreras', value: stats.carreras, icon: GraduationCap, color: 'bg-purple-500' },
  ];

  // Formatear número (ej: 1234 -> 1,234)
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 ml-3">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative bg-linear-to-r from-cyan-600 to-blue-600 rounded-2xl mt-2 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative p-8 md:p-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Catálogo Digital UPTAIET
            </h1>
            <p className="text-white/90 text-lg mb-6">
              Accede a proyectos, libros y recursos académicos de nuestra comunidad universitaria
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/proyecto"
                className="bg-white text-cyan-700 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Explorar Catálogo
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatNumber(stat.value)}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Secciones rápidas */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Accesos Rápidos</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link
            to="/proyecto"
            className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
          >
            <FileText className="h-10 w-10 text-white mx-auto mb-3" />
            <p className="text-white font-semibold">Proyectos</p>
            <p className="text-white/70 text-sm">{stats.tesis} trabajos</p>
          </Link>
          
          <Link
            to="/libros"
            className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
          >
            <Library className="h-10 w-10 text-white mx-auto mb-3" />
            <p className="text-white font-semibold">Libros</p>
            <p className="text-white/70 text-sm">{stats.libros} títulos</p>
          </Link>

          {isAuthenticated && (
            <>
            { [3, 4].includes(user?.id_rol) && (
              <>
              <Link
                to="/carreras"
                className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
              >
                <GraduationCap className="h-10 w-10 text-white mx-auto mb-3" />
                <p className="text-white font-semibold">Carreras</p>
                <p className="text-white/70 text-sm">{stats.carreras} programas</p>
              </Link>
              
              <Link
                to="/materias"
                className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
              >
                <BookOpen className="h-10 w-10 text-white mx-auto mb-3" />
                <p className="text-white font-semibold">Materias</p>
                <p className="text-white/70 text-sm">Plan de estudios</p>
              </Link>
              </>
            )}
              <Link
                to="/perfil"
                className="bg-linear-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
              >
                <User className="h-10 w-10 text-white mx-auto mb-3" />
                <p className="text-white font-semibold">Mi Perfil</p>
                <p className="text-white/70 text-sm">Configuración</p>
              </Link>
            </>
          )}

          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-linear-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
            >
              <LogIn className="h-10 w-10 text-white mx-auto mb-3" />
              <p className="text-white font-semibold">Iniciar Sesión</p>
              <p className="text-white/70 text-sm">Accede a más</p>
            </Link>
          )}
        </div>
      </div>

      {/* proyecto Destacadas */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Proyectos Recientes</h2>
            <p className="text-gray-500 text-sm">Últimos trabajos agregados</p>
          </div>
          <Link to="/proyecto" className="text-cyan-600 hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        {tesisDestacadas.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {tesisDestacadas.map((tesis) => (
              <div key={tesis.id_tesis} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1">
                      {tesis.titulo}
                    </h3>
                    {tesis.promedio_nota && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Award className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-semibold text-yellow-600">{tesis.promedio_nota}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {tesis.resumen_corto || 'Sin resumen disponible'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tesis.nombre_carrera && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {tesis.nombre_carrera}
                      </span>
                    )}
                    {tesis.anio_elaboracion && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {tesis.anio_elaboracion}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{tesis.anio_elaboracion || 'Reciente'}</span>
                    </div>
                    <Link
                      to={`/proyecto/${tesis.id_tesis}`}
                      className="text-cyan-600 font-semibold text-sm hover:underline"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay tesis disponibles</p>
          </div>
        )}
      </div>

      {/* Carreras como categorías */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Explora por Carrera</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {carreras.slice(0, 8).map((carrera) => (
            <Link
              key={carrera.id_carrera}
              to={`/proyecto?id_carrera=${carrera.id_carrera}`}
              className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-cyan-300 hover:shadow-md transition group"
            >
              <p className="text-gray-700 font-medium text-sm group-hover:text-cyan-600 line-clamp-1">
                {carrera.nombre}
              </p>
            </Link>
          ))}
          {carreras.length > 8 && (
            <Link
              to="/carreras"
              className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-cyan-300 hover:shadow-md transition group"
            >
              <Shield className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium text-sm">Ver todas</p>
            </Link>
          )}
        </div>
        {carreras.length === 0 && (
          <p className="text-center text-gray-500 py-4">No hay carreras disponibles</p>
        )}
      </div>
    </div>
  );
}