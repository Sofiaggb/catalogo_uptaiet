import { useEffect, useState } from 'react';
import { 
  CheckCircle, XCircle, Eye, Clock, UserCheck, 
  Search, Filter, ChevronLeft, ChevronRight, 
  RefreshCw, User, Mail, Calendar, FileText, 
  MessageSquare, Shield, IdCard,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../../api/endpoints/admin';
import { showErrorAlert, showSuccessAlert } from '../../helpers/alerts';

interface Solicitud {
  id_solicitud: number;
  usuario_nombre: string;
  usuario_email: string;
  cedula?: string;
  nombre_completo?: string;
  rol_actual: string;
  rol_solicitado: string;
  justificacion: string;
  comentario_admin?: string;
  estado: string;
  id_estado : number;
  fecha_solicitud: string;
  fecha_respuesta?: string;
}

export function SolicitudesRol() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [comentario, setComentario] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [estadisticas, setEstadisticas] = useState({ pendientes: 0, aprobadas: 0, rechazadas: 0, total: 0 });

  useEffect(() => {
    cargarSolicitudes();
    cargarEstadisticas();
  }, [page, filtroEstado]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const result = await adminApi.obtenerSolicitudesRol({
        estado: filtroEstado === 'todos' ? undefined : filtroEstado,
        page,
        limit: 20
      });
      console.log('solicitudes', result)
      if (result.success) {
        setSolicitudes(result.data);
        setTotalPages(result.pagination.pages);
        setTotal(result.pagination.total);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const result = await adminApi.obtenerEstadisticas();
      console.log('estadisticas ',result)
      if (result.success) {
        setEstadisticas(result.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleAprobar = async () => {
    if (!solicitudSeleccionada) return;
    
    const result = await adminApi.aprobarSolicitudRol(solicitudSeleccionada.id_solicitud, comentario);
    if (result.success) {
      showSuccessAlert('Solicitud aprobada correctamente');
      setSolicitudSeleccionada(null);
      setComentario('');
      cargarSolicitudes();
      cargarEstadisticas();
    } else {
      showErrorAlert(result.message || 'Error al aprobar la solicitud');
    }
  };

  const handleRechazar = async () => {
    if (!solicitudSeleccionada) return;
    
    const result = await adminApi.rechazarSolicitudRol(solicitudSeleccionada.id_solicitud, comentario);
    if (result.success) {
      showSuccessAlert('Solicitud rechazada');
      setSolicitudSeleccionada(null);
      setComentario('');
      cargarSolicitudes();
      cargarEstadisticas();
    } else {
      showErrorAlert(result.message || 'Error al rechazar la solicitud');
    }
  };

  const getEstadoBadge = (id_estado: number) => {
    switch (id_estado) {
      case 2  /* 'pendiente'*/:
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3" />
            Pendiente
          </span>
        );
      case 3 /* 'aprobada'*/:
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="h-3 w-3" />
            Aprobada
          </span>
        );
      case 4 /*'rechazada'*/:
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
            <XCircle className="h-3 w-3" />
            Rechazada
          </span>
        );
      default:
        return null;
    }
  };

  const solicitudesFiltradas = solicitudes.filter(s =>
    s.usuario_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.usuario_email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 mt-1 -mx-4 px-5 py-8 mb-6 rounded-2xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Solicitudes de Cambio de Rol</h1>
          <p className="text-white/80">Revisa y gestiona las solicitudes de los usuarios</p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total solicitudes</p>
              <p className="text-2xl font-bold text-gray-800">{estadisticas.total}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-500">Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">{estadisticas.aprobadas}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-500">Rechazadas</p>
              <p className="text-2xl font-bold text-red-600">{estadisticas.rechazadas}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-4 py-2 rounded-lg transition ${
                filtroEstado === 'todos' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroEstado('2')}
              className={`px-4 py-2 rounded-lg transition ${
                filtroEstado === '2' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltroEstado('3')}
              className={`px-4 py-2 rounded-lg transition ${
                filtroEstado === '3' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aprobadas
            </button>
            <button
              onClick={() => setFiltroEstado('4')}
              className={`px-4 py-2 rounded-lg transition ${
                filtroEstado === '4' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rechazadas
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o email..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Usuario</th>
                <th className="text-left p-4 font-semibold text-gray-600">Email</th>
                <th className="text-left p-4 font-semibold text-gray-600">Rol actual → Solicitado</th>
                <th className="text-left p-4 font-semibold text-gray-600">Fecha</th>
                <th className="text-left p-4 font-semibold text-gray-600">Estado</th>
                <th className="text-left p-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-600"></div>
                      <span className="text-gray-500">Cargando solicitudes...</span>
                    </div>
                  </td>
                </tr>
              ) : solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No hay solicitudes para mostrar</p>
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((solicitud) => (
                  <tr key={solicitud.id_solicitud} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{solicitud.usuario_nombre}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{solicitud.usuario_email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {solicitud.rol_actual}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs">
                          {solicitud.rol_solicitado}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      {getEstadoBadge(solicitud.id_estado)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSolicitudSeleccionada(solicitud)}
                        className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Mostrando {solicitudes.length} de {total} solicitudes
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => {
                setPage(1);
                cargarSolicitudes();
              }}
              className="p-2 text-gray-500 hover:text-cyan-600 transition"
              title="Recargar"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal de revisión de solicitud */}
      {solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Revisar solicitud</h3>
              <button
                onClick={() => {
                  setSolicitudSeleccionada(null);
                  setComentario('');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-5">
              {/* Información del usuario */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información del usuario
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Nombre</p>
                    <p className="font-medium">{solicitudSeleccionada.usuario_nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{solicitudSeleccionada.usuario_email}</p>
                  </div>
                  {solicitudSeleccionada.cedula && (
                    <div>
                      <p className="text-gray-500">Cédula</p>
                      <p className="font-medium">{solicitudSeleccionada.cedula}</p>
                    </div>
                  )}
                  {solicitudSeleccionada.nombre_completo && (
                    <div>
                      <p className="text-gray-500">Nombre completo</p>
                      <p className="font-medium">{solicitudSeleccionada.nombre_completo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cambio de rol */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4" />
                  Cambio de rol solicitado
                </h4>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Rol actual</p>
                    <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm mt-1">
                      {solicitudSeleccionada.rol_actual}
                    </span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Rol solicitado</p>
                    <span className="inline-block bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm mt-1">
                      {solicitudSeleccionada.rol_solicitado}
                    </span>
                  </div>
                </div>
              </div>

              {/* Justificación */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  Justificación del usuario
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed p-3 bg-white rounded-lg border border-gray-200">
                  {solicitudSeleccionada.justificacion || 'No se proporcionó justificación'}
                </p>
              </div>

              {/* Comentario del administrador */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Agrega un comentario para el usuario..."
                />
              </div>

              {/* Fechas */}
              <div className="text-xs text-gray-400 flex justify-between pt-2">
                <span>Solicitado: {new Date(solicitudSeleccionada.fecha_solicitud).toLocaleString()}</span>
                {solicitudSeleccionada.fecha_respuesta && (
                  <span>Respondido: {new Date(solicitudSeleccionada.fecha_respuesta).toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Footer con botones */}
            <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
              <button
                onClick={() => {
                  setSolicitudSeleccionada(null);
                  setComentario('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              {solicitudSeleccionada.id_estado == 2  /*'pendiente'*/ && (
                <>
                  <button
                    onClick={handleRechazar}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Rechazar
                  </button>
                  <button
                    onClick={handleAprobar}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprobar
                  </button>
                </>
              )}
              {solicitudSeleccionada.id_estado !== 2 /*'pendiente'*/ && (
                <button
                  onClick={() => {
                    setSolicitudSeleccionada(null);
                    setComentario('');
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}