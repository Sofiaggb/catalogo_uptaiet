import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Eye, FileText, User, Calendar, Search, 
  AlertCircle, Clock, CheckCheck, Filter, ChevronLeft, ChevronRight, Building 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { materiasApi } from '../../api/endpoints/materias';

import { useDebounce } from '../../hooks/useDebounce';
import { showConfirmAlert, showSuccessAlert } from '../../helpers/alerts';
import { librosApi } from '../../api/endpoints/libros';
import Select from 'react-select';

// Configuración de las pestañas
const TABS = [
  { id: 2, label: 'Pendientes', icon: Clock, color: 'text-yellow-600', bgActive: 'border-yellow-500' },
  { id: 1, label: 'Aprobadas', icon: CheckCircle, color: 'text-green-600', bgActive: 'border-green-500' },
  { id: 4, label: 'Rechazadas', icon: XCircle, color: 'text-red-600', bgActive: 'border-red-500' },
];

export function LibroGestion() {
  // Estados principales
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoActivo, setEstadoActivo] = useState(2);

  // Filtros
  const [tiposRecurso, setTiposRecurso] = useState<{ id_tipo_recurso: number, nombre: string }[]>([]);
  const [buscar, setBuscar] = useState('');
  const buscarDebounced = useDebounce(buscar, 500);
  const [materias, setMaterias] = useState([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [aniosSeleccionados, setAniosSeleccionados] = useState([]);
  const [orden, setOrden] = useState('reciente');
  const [showFiltros, setShowFiltros] = useState(false);

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const limit = 30;

  // Modales
  const [modalRechazo, setModalRechazo] = useState(null);
  const [comentarioRechazo, setComentarioRechazo] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    cargarMaterias();
    cargarAnios();
    cargarTiposRecurso(); 
  }, []);

  // Cargar recursos cuando cambien los filtros
  useEffect(() => {
    cargarRecursos();
  }, [
    estadoActivo, 
    buscarDebounced, 
    materiasSeleccionadas, 
    tiposSeleccionados, 
    aniosSeleccionados, 
    orden, 
    page
  ]);

  // Resetear page cuando cambia algún filtro
  useEffect(() => {
    setPage(1);
  }, [buscarDebounced, materiasSeleccionadas, tiposSeleccionados, aniosSeleccionados, orden, estadoActivo]);

  const cargarMaterias = async () => {
    try {
      const data = await materiasApi.getAll();
      setMaterias(data);
    } catch (error) {
      console.error('Error al cargar materias:', error);
    }
  };

  const cargarAnios = async () => {
    try {
      const res = await librosApi.getAnios();
      setAniosDisponibles(res.data || []);
    } catch (error) {
      console.error('Error al cargar años:', error);
    }
  };

    const cargarTiposRecurso = async () => {
    const response = await librosApi.getTiposRecursos();
    if (response && response.success && Array.isArray(response.data)) {
      setTiposRecurso(response.data);
    } else {
      // En caso de que venga vacío o mal formado, ponemos un array vacío para evitar el error
      setTiposRecurso([]);
    }
  };

  const cargarRecursos = async () => {
    setLoading(true);
    try {
      const res = await librosApi.listarGestion({
        buscar: buscarDebounced,
        id_materia: materiasSeleccionadas.length ? materiasSeleccionadas : undefined,
        id_tipo_recurso: tiposSeleccionados.length ? tiposSeleccionados : undefined,
        anio: aniosSeleccionados.length ? aniosSeleccionados : undefined,
        estado: estadoActivo,
        orden,
        page,
        limit,
      });

      setRecursos(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
      setTotalResultados(res.pagination?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los recursos');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id, titulo) => {
    const confirmed = await showConfirmAlert(
      'Aprobar recurso',
      `¿Estás seguro de aprobar el recurso "${titulo}"?`
    );
    if (!confirmed) return;

    try {
      const res = await librosApi.revisar(id, true, 'Aprobado por el revisor');
      if (res.success) {
        showSuccessAlert(res.message);
        window.dispatchEvent(new Event('recurso-revisado'));
        cargarRecursos();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Error al aprobar el recurso');
    }
  };

  const handleRechazar = async () => {
    if (!comentarioRechazo.trim()) {
      toast.error('Debes indicar el motivo del rechazo');
      return;
    }
    try {
      const res = await librosApi.revisar(
        modalRechazo.id, 
        false, 
        comentarioRechazo
      );
      if (res.success) {
        showSuccessAlert(res.message);
        setModalRechazo(null);
        setComentarioRechazo('');
        window.dispatchEvent(new Event('recurso-revisado'));
        cargarRecursos();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Error al rechazar el recurso');
    }
  };

  const filtrosActivos = 
    (buscar ? 1 : 0) + 
    materiasSeleccionadas.length + 
    tiposSeleccionados.length + 
    aniosSeleccionados.length + 
    (orden !== 'reciente' ? 1 : 0);

  const estadoActual = TABS.find(t => t.id === estadoActivo);

  // Opciones para react-select
const opcionesTipos = tiposRecurso.map(t => ({
  value: t.id_tipo_recurso,
  label: t.nombre,
}));

const opcionesMaterias = materias.map(m => ({
  value: m.id_materia,
  label: m.nombre,
}));

const opcionesAnios = aniosDisponibles.map(a => ({
  value: a,
  label: a.toString(),
}));

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Recursos</h1>
        <p className="text-gray-500 text-sm">
          Revisa, aprueba o rechaza libros y guías enviadas por los usuarios
        </p>
      </div>

      {/* Pestañas de estado */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const activo = estadoActivo === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setEstadoActivo(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition whitespace-nowrap border-b-2 ${
                activo 
                  ? `${tab.color} border-current` 
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Buscador + Botón de filtros + Ordenamiento */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <button
          onClick={() => setShowFiltros(!showFiltros)}
          className={`px-4 py-3 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
            showFiltros 
              ? 'bg-cyan-500 text-white' 
              : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          <Filter className="h-5 w-5" />
          Filtros
          {filtrosActivos > 0 && (
            <span className="bg-cyan-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {filtrosActivos}
            </span>
          )}
        </button>

        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="reciente">Más recientes</option>
          <option value="antiguo">Más antiguos</option>
          <option value="titulo">Título (A-Z)</option>
        </select>
      </div>

      {/* Panel de filtros desplegable */}
      {/* Panel de filtros desplegable */}
{showFiltros && (
  <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl space-y-4">
    
   

    <div className="grid md:grid-cols-3 gap-4">
         {/* Filtro de tipo de recurso */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Tipo de recurso
      </label>
      <Select
        isMulti
        isClearable
        isSearchable
        options={opcionesTipos}
        value={opcionesTipos.filter(o => tiposSeleccionados.includes(o.value))}
        onChange={(selected) => {
          setTiposSeleccionados(selected ? selected.map(s => s.value) : []);
          setPage(1);
        }}
        placeholder="Todos los tipos"
        noOptionsMessage={() => 'No hay tipos'}
      />
    </div>
      {/* Filtro de materias (multiselect con búsqueda) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Materias
        </label>
        <Select
          isMulti
          isClearable
          isSearchable
          options={opcionesMaterias}
          value={opcionesMaterias.filter(o =>
            materiasSeleccionadas.includes(o.value)
          )}
          onChange={(selected) => {
            setMateriasSeleccionadas(
              selected ? selected.map(s => s.value) : []
            );
            setPage(1);
          }}
          placeholder="Todas las materias"
          noOptionsMessage={() => 'No hay materias'}
        />
      </div>

      {/* Filtro de años (multiselect con búsqueda) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Años
        </label>
        <Select
          isMulti
          isClearable
          isSearchable
          options={opcionesAnios}
          value={opcionesAnios.filter(o =>
            aniosSeleccionados.includes(o.value)
          )}
          onChange={(selected) => {
            setAniosSeleccionados(
              selected ? selected.map(s => s.value) : []
            );
            setPage(1);
          }}
          placeholder="Todos los años"
          noOptionsMessage={() => 'No hay años'}
        />
      </div>
    </div>

    {/* Filtros activos con botón de limpiar */}
    {(tiposSeleccionados.length > 0 || 
      materiasSeleccionadas.length > 0 || 
      aniosSeleccionados.length > 0) && (
      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {tiposSeleccionados.length + materiasSeleccionadas.length + aniosSeleccionados.length} filtro(s) activo(s)
        </p>
        <button
          onClick={() => {
            setTiposSeleccionados([]);
            setMateriasSeleccionadas([]);
            setAniosSeleccionados([]);
          }}
          className="text-sm text-red-500 hover:text-red-600 underline"
        >
          Limpiar todos los filtros
        </button>
      </div>
    )}
  </div>
)}
      {/* Contador de resultados */}
      <div className="mb-4 flex justify-between items-center text-sm text-gray-500">
        <p>
          Mostrando <span className="font-semibold text-gray-700">{recursos.length}</span> de{' '}
          <span className="font-semibold text-gray-700">{totalResultados}</span> resultados
        </p>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      ) : recursos.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          {estadoActual && (
            <estadoActual.icon className={`h-16 w-16 mx-auto mb-3 ${estadoActual.color} opacity-50`} />
          )}
          <p className="text-gray-500 text-lg">
            No hay recursos {estadoActual?.label.toLowerCase()}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {estadoActivo === 2 ? '¡Todo al día!' : 'Prueba con otro filtro'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recursos.map((item) => (
            <div 
              key={item.id_libro} 
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{item.titulo}</h3>
                    {item.tipo_recurso && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">
                        {item.tipo_recurso}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {item.nombre_materia || 'Sin materia'}
                    </span>
                    {item.autor && (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {item.autor}
                      </span>
                    )}
                    {item.editorial && (
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {item.editorial}
                      </span>
                    )}
                    {item.year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {item.year}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400">
                    Creado por: <strong>{item.nombre_creador || 'Anónimo'}</strong>
                  </p>

                  {/* Comentario de revisión (solo si ya fue revisado) */}
                  {item.comentario_revision && estadoActivo !== 2 && (
                    <div className={`mt-3 p-3 rounded-lg border-l-4 ${
                      estadoActivo === 1 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-red-50 border-red-500'
                    }`}>
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        Comentario del revisor ({item.nombre_revisor}):
                      </p>
                      <p className="text-sm text-gray-700">{item.comentario_revision}</p>
                      {item.fecha_revision && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(item.fecha_revision).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    to={`/libros/${item.id_libro}`}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1 justify-center"
                  >
                    <Eye className="h-4 w-4" /> Ver
                  </Link>

                  {estadoActivo === 2 && (
                    <>
                      <button
                        onClick={() => handleAprobar(item.id_libro, item.titulo)}
                        className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1 justify-center"
                      >
                        <CheckCircle className="h-4 w-4" /> Aprobar
                      </button>
                      <button
                        onClick={() => setModalRechazo({ id: item.id_libro, titulo: item.titulo })}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-1 justify-center"
                      >
                        <XCircle className="h-4 w-4" /> Rechazar
                      </button>
                    </>
                  )}

                  {estadoActivo === 4 && (
                    <button
                      onClick={() => handleAprobar(item.id_libro, item.titulo)}
                      className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1 justify-center"
                    >
                      <CheckCheck className="h-4 w-4" /> Reconsiderar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg font-medium transition ${
                        page === p
                          ? 'bg-cyan-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Modal de Rechazo */}
      {modalRechazo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Rechazar recurso</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Vas a rechazar: <strong>{modalRechazo.titulo}</strong>
            </p>
            <textarea
              value={comentarioRechazo}
              onChange={(e) => setComentarioRechazo(e.target.value)}
              placeholder="Indica el motivo del rechazo (obligatorio)..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setModalRechazo(null);
                  setComentarioRechazo('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}