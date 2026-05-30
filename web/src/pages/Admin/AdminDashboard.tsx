import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, BookOpen, GraduationCap,
  Activity, Settings, Shield, Clock, CheckCircle, XCircle,
  Database, Eye, UserCheck, UserPlus, LogOut
} from 'lucide-react';

const menuItems = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true
  },
  {
    path: '/admin/solicitudes',
    label: 'Solicitudes de Rol',
    icon: UserCheck,
    description: 'Revisa y gestiona solicitudes de cambio de rol'
  },
  {
    path: '/admin/auditoria',
    label: 'Auditoría',
    icon: Activity,
    description: 'Historial de actividades del sistema'
  },
//   {
//     path: '/admin/usuarios',
//     label: 'Usuarios',
//     icon: Users,
//     description: 'Gestionar usuarios del sistema'
//   },
  {
    path: '/admin/estadisticas',
    label: 'Estadísticas',
    icon: Database,
    description: 'Estadísticas del sistema'
  }
];

export function AdminDashboard() {
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalTesis: 0,
    totalLibros: 0,
    totalCarreras: 0,
    solicitudesPendientes: 0
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      // Cargar estadísticas desde la API
      // const result = await adminApi.obtenerEstadisticasGenerales();
      // setStats(result.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-cyan-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Panel Admin</h1>
              <p className="text-xs text-gray-500">Gestión del sistema</p>
            </div>
          </div>
        </div>

        {/* Menú */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive(item.path, item.exact)
                  ? 'bg-cyan-50 text-cyan-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.path, item.exact) ? 'text-cyan-600' : 'text-gray-400'}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="absolute bottom-0 w-72 p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">Última actividad</span>
            </div>
            <p className="text-xs text-gray-600">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Mostrar el contenido de la ruta hija o el dashboard principal */}
          {location.pathname === '/admin' ? (
            <>
              {/* Dashboard principal */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">Bienvenido al panel de administración</p>
              </div>

              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="h-8 w-8 text-blue-500" />
                    <span className="text-2xl font-bold text-gray-800">{stats.totalUsuarios}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600">Usuarios registrados</h3>
                  <p className="text-xs text-gray-400 mt-1">+12 este mes</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="h-8 w-8 text-green-500" />
                    <span className="text-2xl font-bold text-gray-800">{stats.totalTesis}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600">Tesis publicadas</h3>
                  <p className="text-xs text-gray-400 mt-1">+5 este mes</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <BookOpen className="h-8 w-8 text-purple-500" />
                    <span className="text-2xl font-bold text-gray-800">{stats.totalLibros}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600">Libros disponibles</h3>
                  <p className="text-xs text-gray-400 mt-1">+8 este mes</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="h-8 w-8 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-800">{stats.solicitudesPendientes}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600">Solicitudes pendientes</h3>
                  <Link to="/admin/solicitudes" className="text-xs text-cyan-600 hover:underline mt-1 inline-block">
                    Revisar →
                  </Link>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Acciones rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/admin/solicitudes"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-cyan-50 transition group"
                  >
                    <UserCheck className="h-6 w-6 text-gray-400 group-hover:text-cyan-600" />
                    <div>
                      <p className="font-semibold text-gray-700 group-hover:text-cyan-700">Solicitudes de rol</p>
                      <p className="text-xs text-gray-500">Revisar cambios de rol</p>
                    </div>
                  </Link>
                  
                  <Link
                    to="/admin/auditoria"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-cyan-50 transition group"
                  >
                    <Activity className="h-6 w-6 text-gray-400 group-hover:text-cyan-600" />
                    <div>
                      <p className="font-semibold text-gray-700 group-hover:text-cyan-700">Auditoría</p>
                      <p className="text-xs text-gray-500">Ver actividad del sistema</p>
                    </div>
                  </Link>
                  
                  <Link
                    to="/admin/usuarios"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-cyan-50 transition group"
                  >
                    <UserPlus className="h-6 w-6 text-gray-400 group-hover:text-cyan-600" />
                    <div>
                      <p className="font-semibold text-gray-700 group-hover:text-cyan-700">Gestionar usuarios</p>
                      <p className="text-xs text-gray-500">Crear y editar usuarios</p>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}