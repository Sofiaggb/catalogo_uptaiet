import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, LogOut, LogIn, UserPlus, Shield, BookOpen, Settings, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showConfirmAlert, showSuccessAlert } from '../../helpers/alerts';

export function PerfilDetail() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogout = async () => {
    const confirmed = await showConfirmAlert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?'
    );
    
    if (confirmed) {
      await logout();
      showSuccessAlert('Sesión cerrada correctamente', () => navigate('/'));
    }
  };

  // Si NO está autenticado, mostrar pantalla de invitado
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 mt-1 -mx-4 px-5 py-8 mb-6 rounded-2xl">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
            <p className="text-white/80">Accede a tu cuenta para más funciones</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          {/* Icono invitado */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitado</h2>
          <p className="text-gray-500 mb-8">
            Inicia sesión para acceder a más funciones
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Botón Iniciar Sesión */}
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition"
            >
              <LogIn className="h-5 w-5" />
              Iniciar Sesión
            </button>

            {/* Botón Registrarse */}
            <button
              onClick={handleRegister}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              <UserPlus className="h-5 w-5" />
              Crear Cuenta
            </button>
          </div>

          {/* Beneficios de registrarse */}
          <div className="mt-10 p-6 bg-gray-50 rounded-xl text-left">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-600" />
              Beneficios de registrarte
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                Subir tus propias tesis y proyectos
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                Evaluar trabajos académicos
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                Guardar tus materiales favoritos
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                Acceder a contenido exclusivo
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar perfil completo
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 mt-1 -mx-4 px-5 py-8 mb-6 rounded-2xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
          <p className="text-white/80">Gestiona tu información personal</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Información del perfil */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800">{user?.nombre}</h2>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                  <Shield className="h-3 w-3" />
                  {user?.rol || 'Usuario'}
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Miembro desde {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opciones del perfil */}
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-cyan-600" />
            Configuración
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group">
              <User className="h-5 w-5 text-gray-400 group-hover:text-cyan-500" />
              <span className="text-gray-700">Editar perfil</span>
              <span className="ml-auto text-gray-400">→</span>
            </button>
            <button className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group">
              <Mail className="h-5 w-5 text-gray-400 group-hover:text-cyan-500" />
              <span className="text-gray-700">Cambiar email</span>
              <span className="ml-auto text-gray-400">→</span>
            </button>
            <button className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group">
              <Lock className="h-5 w-5 text-gray-400 group-hover:text-cyan-500" />
              <span className="text-gray-700">Cambiar contraseña</span>
              <span className="ml-auto text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Estadísticas / Actividad reciente */}
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-600" />
            Mi actividad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-cyan-600">0</p>
              <p className="text-sm text-gray-500">Tesis publicadas</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-cyan-600">0</p>
              <p className="text-sm text-gray-500">Evaluaciones realizadas</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-cyan-600">0</p>
              <p className="text-sm text-gray-500">Documentos guardados</p>
            </div>
          </div>
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="p-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}