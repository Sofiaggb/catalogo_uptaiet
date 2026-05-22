import { Link } from 'react-router-dom';
import { 
  BookOpen, FileText, Library, GraduationCap, User, LogIn, 
  TrendingUp, Award, Clock, ChevronRight, Calendar, Eye 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { isAuthenticated } = useAuth();

  const stats = [
    { label: 'Tesis Publicadas', value: '1,234', icon: FileText, color: 'bg-blue-500' },
    { label: 'Libros Digitales', value: '567', icon: Library, color: 'bg-green-500' },
    { label: 'Carreras', value: '45', icon: GraduationCap, color: 'bg-purple-500' },
    { label: 'Usuarios Activos', value: '2,345', icon: User, color: 'bg-orange-500' },
  ];

  const tesisDestacadas = [
    {
      id: 1,
      titulo: 'Machine Learning en Educación',
      autores: ['María Rojas', 'Carlos Méndez'],
      carrera: 'Ingeniería Informática',
      año: 2024,
      vistas: 234,
      calificacion: 4.8,
    },
    {
      id: 2,
      titulo: 'Blockchain para Certificación Académica',
      autores: ['Ana Torres', 'Javier Paz'],
      carrera: 'Ingeniería de Sistemas',
      año: 2024,
      vistas: 189,
      calificacion: 4.6,
    },
    {
      id: 3,
      titulo: 'IoT para Monitoreo Agrícola',
      autores: ['Luis García', 'Sofía Martínez'],
      carrera: 'Ingeniería Electrónica',
      año: 2023,
      vistas: 156,
      calificacion: 4.9,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative p-8 md:p-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Catálogo Digital UPTAIET
            </h1>
            <p className="text-white/90 text-lg mb-6">
              Accede a tesis, libros y recursos académicos de nuestra comunidad universitaria
            </p>
            <div className="flex gap-4">
              <Link
                to="/proyecto"
                className="bg-white text-cyan-700 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Explorar Catálogo
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
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
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
          >
            <FileText className="h-10 w-10 text-white mx-auto mb-3" />
            <p className="text-white font-semibold">Tesis</p>
            <p className="text-white/70 text-sm">+200 trabajos</p>
          </Link>
          
          <Link
            to="/libros"
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
          >
            <Library className="h-10 w-10 text-white mx-auto mb-3" />
            <p className="text-white font-semibold">Libros</p>
            <p className="text-white/70 text-sm">+500 títulos</p>
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/carreras"
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
              >
                <GraduationCap className="h-10 w-10 text-white mx-auto mb-3" />
                <p className="text-white font-semibold">Carreras</p>
                <p className="text-white/70 text-sm">45 programas</p>
              </Link>
              
              <Link
                to="/materias"
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
              >
                <BookOpen className="h-10 w-10 text-white mx-auto mb-3" />
                <p className="text-white font-semibold">Materias</p>
                <p className="text-white/70 text-sm">+300 materias</p>
              </Link>
              
              <Link
                to="/perfil"
                className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
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
              className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-center hover:scale-105 transition-transform"
            >
              <LogIn className="h-10 w-10 text-white mx-auto mb-3" />
              <p className="text-white font-semibold">Iniciar Sesión</p>
              <p className="text-white/70 text-sm">Accede a más</p>
            </Link>
          )}
        </div>
      </div>

      {/* Tesis Destacadas */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Proyectos Destacados</h2>
            <p className="text-gray-500 text-sm">Los trabajos más vistos del mes</p>
          </div>
          <Link to="/proyecto" className="text-cyan-600 hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tesisDestacadas.map((tesis) => (
            <div key={tesis.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1">
                    {tesis.titulo}
                  </h3>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                    <Award className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-semibold text-yellow-600">{tesis.calificacion}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">
                  {tesis.autores.join(' · ')}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {tesis.carrera}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {tesis.año}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Eye className="h-4 w-4" />
                    <span>{tesis.vistas} vistas</span>
                  </div>
                  <Link
                    to={`/proyecto/${tesis.id}`}
                    className="text-cyan-600 font-semibold text-sm hover:underline"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categorías Populares */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Explora por Categoría</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Ingeniería', 'Ciencias', 'Humanidades', 'Salud', 'Artes', 'Educación', 'Tecnología', 'Administración'].map((cat) => (
            <Link
              key={cat}
              to={`/proyecto?categoria=${cat}`}
              className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-cyan-300 hover:shadow-md transition group"
            >
              <p className="text-gray-700 font-medium group-hover:text-cyan-600">{cat}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}