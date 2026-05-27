import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, LogOut, LogIn, UserPlus, Shield, BookOpen, Settings, Lock, CheckCircle, Send, XCircle, Clock, IdCard, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showConfirmAlert, showSuccessAlert } from '../../helpers/alerts';
import { profileApi } from '../../api/endpoints/perfil';
import { useEffect, useState } from 'react';
import type { Rol, SolicitudEstado } from '../../api/types';

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

  // En el componente Profile, agregar:
const [showSolicitudModal, setShowSolicitudModal] = useState(false);
const [rolSolicitado, setRolSolicitado] = useState('');
const [justificacion, setJustificacion] = useState('');
const [solicitudEstado, setSolicitudEstado] = useState<SolicitudEstado | null>(null);
const [cargandoSolicitud, setCargandoSolicitud] = useState(false);

// Verificar estado de solicitud existente
useEffect(() => {
  if (isAuthenticated) {
    verificarEstadoSolicitud();
  }
}, [isAuthenticated]);

const verificarEstadoSolicitud = async () => {
  const result = await profileApi.obtenerEstadoSolicitud();
  if (result.success && result.data) {
    setSolicitudEstado(result.data);
  }
};

// En el componente Profile, agregar estos estados:
const [rolesDisponibles, setRolesDisponibles] = useState<Rol[]>([]);
const [cargandoRoles, setCargandoRoles] = useState(false);
const [cedula, setCedula] = useState('');
const [nombreCompleto, setNombreCompleto] = useState('');
const [erroresForm, setErroresForm] = useState({
  cedula: '',
  nombreCompleto: '',
  rol: '',
  justificacion: ''
});

// Cargar roles disponibles al abrir el modal
const handleAbrirModal = async () => {
  setShowSolicitudModal(true);
  setCargandoRoles(true);
  try {
    const result = await profileApi.obtenerRolesDisponibles();
    if (result.success) {
      setRolesDisponibles(result.data);
    }
  } catch (error) {
    console.error('Error cargando roles:', error);
  } finally {
    setCargandoRoles(false);
  }
};

// Validar formulario
const validarFormulario = () => {
  let isValid = true;
  const nuevosErrores = {
    cedula: '',
    nombreCompleto: '',
    rol: '',
    justificacion: ''
  };
  
  if (!cedula.trim()) {
    nuevosErrores.cedula = 'La cédula es obligatoria';
    isValid = false;
  } else if (!/^[VEJPG]\d{6,8}$/i.test(cedula.trim())) {
    nuevosErrores.cedula = 'Formato de cédula inválido (Ej: V12345678)';
    isValid = false;
  }
  
  if (!nombreCompleto.trim()) {
    nuevosErrores.nombreCompleto = 'El nombre completo es obligatorio';
    isValid = false;
  } else if (nombreCompleto.trim().length < 5) {
    nuevosErrores.nombreCompleto = 'Ingresa el nombre completo';
    isValid = false;
  }
  
  if (!rolSolicitado) {
    nuevosErrores.rol = 'Selecciona un rol';
    isValid = false;
  }
  
  if (!justificacion.trim()) {
    nuevosErrores.justificacion = 'La justificación es obligatoria';
    isValid = false;
  } else if (justificacion.trim().length < 20) {
    nuevosErrores.justificacion = 'La justificación debe tener al menos 20 caracteres';
    isValid = false;
  }
  
  setErroresForm(nuevosErrores);
  return isValid;
};

const handleEnviarSolicitud = async () => {
  if (!validarFormulario()) return;
  
  setCargandoSolicitud(true);
  const result = await profileApi.enviarSolicitudCambioRol({
    id_rol: parseInt(rolSolicitado),
    justificacion,
    cedula,
    nombre_completo: nombreCompleto
  });
  
  if (result.success) {
    alert('Solicitud enviada correctamente');
    setShowSolicitudModal(false);
    verificarEstadoSolicitud();
    // Limpiar formulario
    setRolSolicitado('');
    setJustificacion('');
    setCedula('');
    setNombreCompleto('');
  } else {
    alert(result.message || 'Error al enviar solicitud');
  }
  setCargandoSolicitud(false);
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

        {/* // Agregar en la sección de configuración: */}
<div className="border-t border-gray-200 pt-4 mt-4">
  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
    <Shield className="h-5 w-5 text-cyan-600" />
    Cambio de Rol
  </h3>
  
  {solicitudEstado?.estado === 'pendiente' && (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 text-yellow-700 mb-2">
        <Clock className="h-5 w-5" />
        <span className="font-semibold">Solicitud pendiente</span>
      </div>
      <p className="text-sm text-yellow-600">
        Tu solicitud está siendo revisada por el administrador.
      </p>
    </div>
  )}
  
  {solicitudEstado?.estado === 'aprobada' && (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 text-green-700 mb-2">
        <CheckCircle className="h-5 w-5" />
        <span className="font-semibold">Solicitud aprobada</span>
      </div>
      <p className="text-sm text-green-600">
        ¡Felicidades! Tu rol ha sido actualizado a {solicitudEstado.rol_solicitado_nombre}.
      </p>
    </div>
  )}
  
  {solicitudEstado?.estado === 'rechazada' && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 text-red-700 mb-2">
        <XCircle className="h-5 w-5" />
        <span className="font-semibold">Solicitud rechazada</span>
      </div>
      <p className="text-sm text-red-600">
        {solicitudEstado.comentario_admin || 'Tu solicitud fue rechazada. Puedes intentar nuevamente.'}
      </p>
    </div>
  )}
  
  {/* Botón para abrir el modal */}
{!solicitudEstado && user?.rol === 'estudiante' && (
  <button
    onClick={handleAbrirModal}
    className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-600 transition"
  >
    <Send className="h-4 w-4" />
    Solicitar cambio de rol
  </button>
)}
  
  {user?.rol !== 'estudiante' && (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
      <p className="text-gray-600">Ya tienes un rol especial: {user?.rol}</p>
      <p className="text-sm text-gray-400">No puedes solicitar otro cambio de rol.</p>
    </div>
  )}
</div>

{/* Modal de solicitud mejorado */}
{showSolicitudModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
        <h3 className="text-xl font-bold text-gray-800">Solicitar cambio de rol</h3>
        <button
          onClick={() => setShowSolicitudModal(false)}
          className="p-1 hover:bg-gray-100 rounded-full transition"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      
      <div className="p-6 space-y-5">
        {/* Cédula */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cédula <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                erroresForm.cedula ? 'border-red-500' : 'border-gray-300'
              }`}
              value={cedula}
              onChange={(e) => {
                setCedula(e.target.value);
                setErroresForm({ ...erroresForm, cedula: '' });
              }}
              placeholder="V12345678"
            />
          </div>
          {erroresForm.cedula && (
            <p className="text-red-500 text-xs mt-1">{erroresForm.cedula}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Formato: Letra (V/E/J/P/G) + 6-8 dígitos
          </p>
        </div>
        
        {/* Nombre completo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                erroresForm.nombreCompleto ? 'border-red-500' : 'border-gray-300'
              }`}
              value={nombreCompleto}
              onChange={(e) => {
                setNombreCompleto(e.target.value);
                setErroresForm({ ...erroresForm, nombreCompleto: '' });
              }}
              placeholder="Juan Pérez García"
            />
          </div>
          {erroresForm.nombreCompleto && (
            <p className="text-red-500 text-xs mt-1">{erroresForm.nombreCompleto}</p>
          )}
        </div>
        
        {/* Rol deseado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Rol deseado <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                erroresForm.rol ? 'border-red-500' : 'border-gray-300'
              }`}
              value={rolSolicitado}
              onChange={(e) => {
                setRolSolicitado(e.target.value);
                setErroresForm({ ...erroresForm, rol: '' });
              }}
            >
              <option value="">Selecciona un rol</option>
              {cargandoRoles ? (
                <option disabled>Cargando...</option>
              ) : (
                rolesDisponibles.map((rol) => (
                  <option key={rol.id_rol} value={rol.id_rol}>
                    {rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)}
                  </option>
                ))
              )}
            </select>
          </div>
          {erroresForm.rol && (
            <p className="text-red-500 text-xs mt-1">{erroresForm.rol}</p>
          )}
        </div>
        
        {/* Justificación */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Justificación <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              erroresForm.justificacion ? 'border-red-500' : 'border-gray-300'
            }`}
            value={justificacion}
            onChange={(e) => {
              setJustificacion(e.target.value);
              setErroresForm({ ...erroresForm, justificacion: '' });
            }}
            placeholder="Explica por qué necesitas este cambio de rol. (Mínimo 20 caracteres)"
          />
          {erroresForm.justificacion && (
            <p className="text-red-500 text-xs mt-1">{erroresForm.justificacion}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {justificacion.length}/20 caracteres mínimos
          </p>
        </div>
      </div>
      
      {/* Footer con botones */}
      <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => setShowSolicitudModal(false)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleEnviarSolicitud}
          disabled={cargandoSolicitud}
          className="flex-1 bg-cyan-500 text-white py-2 rounded-lg hover:bg-cyan-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {cargandoSolicitud ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar solicitud
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}

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