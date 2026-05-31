import { useEffect, useState } from 'react';
import { 
  Database, Plus, Edit, Trash2, TrendingUp,  Calendar, Activity, FileText, Users, BookOpen,  BarChart3
} from 'lucide-react';
import { adminApi } from '../../api/endpoints/admin';

interface EstadisticaTabla {
  tabla: string;
  total: number;
  inserts: number;
  updates: number;
  deletes: number;
  usuarios_distintos: number;
}

export function Estadisticas() {
  const [estadisticas, setEstadisticas] = useState<EstadisticaTabla[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalGeneral, setTotalGeneral] = useState(0);
  const [totalInserts, setTotalInserts] = useState(0);
  const [totalUpdates, setTotalUpdates] = useState(0);
  const [totalDeletes, setTotalDeletes] = useState(0);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

 const cargarEstadisticas = async () => {
  setLoading(true);
  try {
    const result = await adminApi.obtenerEstadisticasAuditoria();
    if (result.success) {
      setEstadisticas(result.data);
      
      //  Asegurar que los valores son números (no strings)
      let totalGral = 0;
      let insertsGral = 0;
      let updatesGral = 0;
      let deletesGral = 0;
      
      result.data.forEach((stat: EstadisticaTabla) => {
        // Convertir a número por si vienen como string
        const total = Number(stat.total) || 0;
        const inserts = Number(stat.inserts) || 0;
        const updates = Number(stat.updates) || 0;
        const deletes = Number(stat.deletes) || 0;
        
        totalGral += total;
        insertsGral += inserts;
        updatesGral += updates;
        deletesGral += deletes;
      });
      
      setTotalGeneral(totalGral);
      setTotalInserts(insertsGral);
      setTotalUpdates(updatesGral);
      setTotalDeletes(deletesGral);
    }
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  } finally {
    setLoading(false);
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
    <div className="space-y-6">
      {/* Tarjetas de resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total eventos</p>
              <p className="text-3xl font-bold">{totalGeneral}</p>
            </div>
            <Database className="h-10 w-10 text-white/50" />
          </div>
          <p className="text-white/60 text-xs mt-2">Últimos 30 días</p>
        </div>
        
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Creaciones</p>
              <p className="text-3xl font-bold">+{totalInserts}</p>
            </div>
            <Plus className="h-10 w-10 text-white/50" />
          </div>
          <p className="text-white/60 text-xs mt-2">Nuevos registros</p>
        </div>
        
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Modificaciones</p>
              <p className="text-3xl font-bold">~{totalUpdates}</p>
            </div>
            <Edit className="h-10 w-10 text-white/50" />
          </div>
          <p className="text-white/60 text-xs mt-2">Actualizaciones</p>
        </div>
        
        <div className="bg-linear-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Eliminaciones</p>
              <p className="text-3xl font-bold">-{totalDeletes}</p>
            </div>
            <Trash2 className="h-10 w-10 text-white/50" />
          </div>
          <p className="text-white/60 text-xs mt-2">Registros eliminados</p>
        </div>
      </div>

      {/* Gráfico de actividad por tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-600" />
            Actividad por tabla
          </h2>
          <p className="text-sm text-gray-500">Resumen de cambios en los últimos 30 días</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Tabla</th>
                <th className="text-center p-4 font-semibold text-gray-600">Total</th>
                <th className="text-center p-4 font-semibold text-gray-600">Creaciones</th>
                <th className="text-center p-4 font-semibold text-gray-600">Modificaciones</th>
                <th className="text-center p-4 font-semibold text-gray-600">Eliminaciones</th>
                <th className="text-center p-4 font-semibold text-gray-600">Usuarios</th>
              </tr>
            </thead>
            <tbody>
              {estadisticas.map((stat, idx) => {
                // Calcular porcentajes para la barra visual
                const maxTotal = Math.max(...estadisticas.map(s => s.total), 1);
                const porcentaje = (stat.total / maxTotal) * 100;
                
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-2">
                        {stat.tabla === 'tesis' && <FileText className="h-4 w-4 text-blue-500" />}
                        {stat.tabla === 'usuario' && <Users className="h-4 w-4 text-purple-500" />}
                        {stat.tabla === 'libro' && <BookOpen className="h-4 w-4 text-green-500" />}
                        {!['tesis', 'usuario', 'libro'].includes(stat.tabla) && <Activity className="h-4 w-4 text-gray-400" />}
                        {stat.tabla}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{stat.total}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-cyan-500 h-2 rounded-full" 
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-green-600 font-medium">+{stat.inserts}</td>
                    <td className="p-4 text-center text-blue-600 font-medium">~{stat.updates}</td>
                    <td className="p-4 text-center text-red-600 font-medium">-{stat.deletes}</td>
                    <td className="p-4 text-center text-gray-600">{stat.usuarios_distintos}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparativa visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-600" />
            Distribución de acciones
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Creaciones</span>
                <span className="text-green-600">{Math.round((totalInserts / totalGeneral) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full" 
                  style={{ width: `${(totalInserts / totalGeneral) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Modificaciones</span>
                <span className="text-blue-600">{Math.round((totalUpdates / totalGeneral) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full" 
                  style={{ width: `${(totalUpdates / totalGeneral) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Eliminaciones</span>
                <span className="text-red-600">{Math.round((totalDeletes / totalGeneral) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full" 
                  style={{ width: `${(totalDeletes / totalGeneral) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-600" />
            Resumen ejecutivo
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              En los últimos 30 días se han registrado <strong className="text-cyan-600">{totalGeneral}</strong> eventos 
              en el sistema, distribuidos en <strong className="text-green-600">{totalInserts} creaciones</strong>, 
              <strong className="text-blue-600"> {totalUpdates} modificaciones</strong> y 
              <strong className="text-red-600"> {totalDeletes} eliminaciones</strong>.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <p className="text-xs text-gray-500">
                 La tabla con más actividad es <strong>{estadisticas[0]?.tabla}</strong> con 
                <strong> {estadisticas[0]?.total}</strong> cambios.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                 Han participado <strong>{estadisticas.reduce((acc, s) => acc + (s.usuarios_distintos || 0), 0)}</strong> 
                usuarios distintos en estas actividades.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}