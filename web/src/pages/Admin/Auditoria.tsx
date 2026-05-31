import { useEffect, useState } from 'react';
import { 
  Eye,  User, Database, 
   ChevronLeft, ChevronRight, RefreshCw,
   Edit, Trash2, Plus, Clock, Wifi,
  XCircle
} from 'lucide-react';
import { adminApi } from '../../api/endpoints/admin';

interface LogActividad {
  id_log: number;
  esquema: string;
  tabla: string;
  registro_id: number;
  accion: string;
  fecha: string;
  id_usuario: number;
  usuario_nombre: string;
  usuario_email: string;
  ip_address: string;
  user_agent: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
}

export function Auditoria() {
  const [logs, setLogs] = useState<LogActividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogActividad | null>(null);
  const [filtros, setFiltros] = useState({
    tabla: '',
    accion: '',
    usuario: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [accionesDisponibles, setAccionesDisponibles] = useState<string[]>([]);
  const [tablasDisponibles, setTablasDisponibles] = useState<any[]>([]);

  useEffect(() => {
    cargarLogs();
    cargarFiltros();
  }, [page, filtros]);

  const cargarLogs = async () => {
    setLoading(true);
    try {
      
      const result = await adminApi.obtenerLogsAuditoria({
        page,
        limit: 20,
        tabla: filtros.tabla || undefined,
        accion: filtros.accion || undefined,
        usuario: filtros.usuario || undefined,
        fecha_desde: filtros.fecha_desde || undefined,
        fecha_hasta: filtros.fecha_hasta || undefined
      });

      if (result.success) {
        setLogs(result.data);
        setTotalPages(result.pagination.pages);
        setTotal(result.pagination.total);
      }
    } catch (error) {
      console.error('Error cargando logs:', error);
    } finally {
      setLoading(false);
    }
  };


  const cargarFiltros = async () => {
    try {
      const [acciones, tablas] = await Promise.all([
        adminApi.obtenerAccionesAuditoria(),
        adminApi.obtenerTablasAuditoria()
      ]);

      console.log(acciones, tablas)
      if (acciones.success) setAccionesDisponibles(acciones.data);
      if (tablas.success) setTablasDisponibles(tablas.data);
    } catch (error) {
      console.error('Error cargando filtros:', error);
    }
  };

  const getAccionBadge = (accion: string) => {
    switch (accion) {
      case 'INSERT':
        return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"><Plus className="h-3 w-3" /> Creación</span>;
      case 'UPDATE':
        return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"><Edit className="h-3 w-3" /> Edición</span>;
      case 'DELETE':
        return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs"><Trash2 className="h-3 w-3" /> Eliminación</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{accion}</span>;
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      tabla: '',
      accion: '',
      usuario: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 mt-1 -mx-4 px-5 py-8 mb-6 rounded-2xl 
      flex justify-between">
        <div className="max-w-7xl ">
          <h1 className="text-3xl font-bold text-white mb-2">Auditoría</h1>
          <p className="text-white/80">Registro de todas las actividades del sistema</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total registros</p>
              <p className="text-2xl font-bold text-gray-800">{total}</p>
            </div>
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
              <Database className="h-5 w-5 text-cyan-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
       
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Tabla</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filtros.tabla}
                onChange={(e) => setFiltros({ ...filtros, tabla: e.target.value })}
              >
                <option value="">Todas</option>
                {tablasDisponibles.map(t => (
                  <option key={t.tabla} value={t.tabla}>
                    {t.esquema}.{t.tabla}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Acción</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filtros.accion}
                onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
              >
                <option value="">Todas</option>
                {accionesDisponibles.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Usuario</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="usuario"
                value={filtros.usuario}
                onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha desde</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filtros.fecha_desde}
                onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha hasta</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filtros.fecha_hasta}
                onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
              />
            </div>
          </div>
        
        
        {(filtros.tabla || filtros.accion || filtros.usuario || filtros.fecha_desde || filtros.fecha_hasta) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={limpiarFiltros}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla de logs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Fecha/Hora</th>
                <th className="text-left p-4 font-semibold text-gray-600">Usuario</th>
                <th className="text-left p-4 font-semibold text-gray-600">Tabla</th>
                <th className="text-left p-4 font-semibold text-gray-600">Acción</th>
                <th className="text-left p-4 font-semibold text-gray-600">IP</th>
                <th className="text-left p-4 font-semibold text-gray-600"></th>
               </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-600"></div>
                      <span className="text-gray-500">Cargando...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    No hay registros de actividad
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id_log} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.fecha).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{log.usuario_nombre || 'Sistema'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.tabla}
                      </code>
                    </td>
                    <td className="p-4">{getAccionBadge(log.accion)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Wifi className="h-3 w-3 text-gray-400" />
                        <span className="text-xs font-mono">{log.ip_address || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
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
              Mostrando {logs.length} de {total} registros
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 text-sm">Página {page} de {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <button onClick={cargarLogs} className="p-2 text-gray-500 hover:text-cyan-600">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Detalle de auditoría</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID Log</p>
                  <p className="font-medium">{selectedLog.id_log}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{new Date(selectedLog.fecha).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Usuario</p>
                  <p className="font-medium">{selectedLog.usuario_nombre || 'Sistema'}</p>
                  <p className="text-xs text-gray-400">{selectedLog.usuario_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP / User Agent</p>
                  <p className="font-medium">{selectedLog.ip_address || '-'}</p>
                  <p className="text-xs text-gray-400 truncate">{selectedLog.user_agent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tabla</p>
                  <p className="font-medium">{selectedLog.tabla}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Acción</p>
                  <p>{getAccionBadge(selectedLog.accion)}</p>
                </div>
              </div>
              
              {selectedLog.datos_anteriores && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Datos anteriores</p>
                  <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.datos_anteriores, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.datos_nuevos && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Datos nuevos</p>
                  <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.datos_nuevos, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}