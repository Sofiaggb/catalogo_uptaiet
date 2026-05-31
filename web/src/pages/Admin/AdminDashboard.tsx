import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {   LayoutDashboard,Menu, X,  Activity, Shield, Clock, ChevronRight,  Database, UserCheck, LogOut
} from 'lucide-react';
import { adminApi } from '../../api/endpoints/admin';
import { useAuth } from '../../contexts/AuthContext';

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
  {
    path: '/admin/estadisticas',
    label: 'Estadísticas',
    icon: Database,
    description: 'Estadísticas del sistema'
  }
];

export function AdminDashboard() {
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Cerrar sidebar al cambiar de ruta (en móvil)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const cargarEstadisticas = async () => {
    try {
      const result = await adminApi.obtenerEstadisticasGenerales();
      setStats(result.data);
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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100">
      {/* El header de la app ya está afuera, este es solo el contenido del admin */}
      <div className="flex flex-1 overflow-hidden">
        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:relative z-50 bg-white border-r border-gray-200 flex-shrink-0
          w-72 h-full overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Logo y botón cerrar */}
          <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-cyan-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Panel Admin</h1>
                <p className="text-xs text-gray-500">Gestión del sistema</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Menú */}
          <nav className="p-4 space-y-1 pb-32">
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

          {/* Botón cerrar sesión móvil */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>

          {/* Footer desktop */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
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
        <main className="flex-1 overflow-y-auto bg-gray-100 w-full">
          {/* Header móvil con botón de menú */}
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-cyan-600" />
                <h1 className="text-lg font-bold text-gray-800">Panel Admin</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-4 md:p-8">
            {location.pathname === '/admin' ? (
              <>
                {/* Dashboard principal */}
                <div className="mb-6 md:mb-8">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
                  <p className="text-sm text-gray-500">Bienvenido al panel de administración</p>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
                      <span className="text-xl md:text-2xl font-bold text-gray-800">{stats.solicitudesPendientes || 0}</span>
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold text-gray-600">Solicitudes pendientes</h3>
                    <Link to="/admin/solicitudes" className="text-xs text-cyan-600 hover:underline mt-1 inline-block">
                      Revisar →
                    </Link>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Acciones rápidas</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <Link
                      to="/admin/solicitudes"
                      className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-cyan-50 transition group"
                    >
                      <UserCheck className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-hover:text-cyan-600" />
                      <div>
                        <p className="font-semibold text-sm md:text-base text-gray-700 group-hover:text-cyan-700">Solicitudes de rol</p>
                        <p className="text-xs text-gray-500">Revisar cambios de rol</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                    </Link>
                    
                    <Link
                      to="/admin/auditoria"
                      className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-cyan-50 transition group"
                    >
                      <Activity className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-hover:text-cyan-600" />
                      <div>
                        <p className="font-semibold text-sm md:text-base text-gray-700 group-hover:text-cyan-700">Auditoría</p>
                        <p className="text-xs text-gray-500">Ver actividad del sistema</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                    </Link>
                    
                    <Link
                      to="/admin/estadisticas"
                      className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-cyan-50 transition group"
                    >
                      <Database className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-hover:text-cyan-600" />
                      <div>
                        <p className="font-semibold text-sm md:text-base text-gray-700 group-hover:text-cyan-700">Estadísticas</p>
                        <p className="text-xs text-gray-500">Ver métricas del sistema</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
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
    </div>
  );
}