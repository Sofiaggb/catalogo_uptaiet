import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, UserCheck } from 'lucide-react';
import { adminApi } from '../../api/endpoints/admin';

export function SolicitudesRol() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<any>(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    const data = await adminApi.obtenerSolicitudesRol();
    setSolicitudes(data);
    setLoading(false);
  };

  const handleAprobar = async (id: number) => {
    const result = await adminApi.aprobarSolicitudRol(id, comentario);
    if (result.success) {
      alert('Solicitud aprobada');
      cargarSolicitudes();
      setSolicitudSeleccionada(null);
      setComentario('');
    } else {
      alert(result.message || 'Error al aprobar');
    }
  };

  const handleRechazar = async (id: number) => {
    const result = await adminApi.rechazarSolicitudRol(id, comentario);
    if (result.success) {
      alert('Solicitud rechazada');
      cargarSolicitudes();
      setSolicitudSeleccionada(null);
      setComentario('');
    } else {
      alert(result.message || 'Error al rechazar');
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs"><Clock className="h-3 w-3" /> Pendiente</span>;
      case 'aprobada':
        return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"><CheckCircle className="h-3 w-3" /> Aprobada</span>;
      case 'rechazada':
        return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs"><XCircle className="h-3 w-3" /> Rechazada</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 -mt-8 -mx-4 px-5 py-8 mb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Solicitudes de Cambio de Rol</h1>
          <p className="text-white/80">Revisa y gestiona las solicitudes de los usuarios</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Usuario</th>
                <th className="text-left p-4 font-semibold text-gray-600">Email</th>
                <th className="text-left p-4 font-semibold text-gray-600">Rol actual</th>
                <th className="text-left p-4 font-semibold text-gray-600">Rol solicitado</th>
                <th className="text-left p-4 font-semibold text-gray-600">Fecha</th>
                <th className="text-left p-4 font-semibold text-gray-600">Estado</th>
                <th className="text-left p-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud: any) => (
                <tr key={solicitud.id_solicitud} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium">{solicitud.usuario_nombre}</td>
                  <td className="p-4 text-gray-600">{solicitud.usuario_email}</td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {solicitud.rol_actual}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs">
                      {solicitud.rol_solicitado}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                  </td>
                  <td className="p-4">{getEstadoBadge(solicitud.estado)}</td>
                  <td className="p-4">
                    {solicitud.estado === 'pendiente' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSolicitudSeleccionada(solicitud)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Ver detalles"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de revisión */}
      {solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Revisar solicitud</h3>
            
            <div className="space-y-3 mb-4">
              <p><strong>Usuario:</strong> {solicitudSeleccionada.usuario_nombre}</p>
              <p><strong>Email:</strong> {solicitudSeleccionada.usuario_email}</p>
              <p><strong>Rol actual:</strong> {solicitudSeleccionada.rol_actual}</p>
              <p><strong>Rol solicitado:</strong> {solicitudSeleccionada.rol_solicitado}</p>
              {solicitudSeleccionada.justificacion && (
                <div>
                  <strong>Justificación:</strong>
                  <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                    {solicitudSeleccionada.justificacion}
                  </p>
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Agrega un comentario..."
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSolicitudSeleccionada(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRechazar(solicitudSeleccionada.id_solicitud)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                Rechazar
              </button>
              <button
                onClick={() => handleAprobar(solicitudSeleccionada.id_solicitud)}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                Aprobar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}