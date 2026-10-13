import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Eye, FileText, User, Calendar, Search,
  AlertCircle, Clock, CheckCheck, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { carrerasApi } from '../../api/endpoints/carreras';
import { useDebounce } from '../../hooks/useDebounce';
import { Link } from 'react-router-dom';
import { tesisApi } from '../../api/endpoints/tesis';
import { showConfirmAlert, showSuccessAlert } from '../../helpers/alerts';
import Select from 'react-select';

//  Configuración de las pestañas
const TABS = [
  { id: 2, label: 'Pendientes', icon: Clock, color: 'text-yellow-600', bgActive: 'border-yellow-500' },
  { id: 1, label: 'Aprobadas', icon: CheckCircle, color: 'text-green-600', bgActive: 'border-green-500' },
  { id: 4, label: 'Rechazadas', icon: XCircle, color: 'text-red-600', bgActive: 'border-red-500' },
];

export function TesisGestion() {
  const [tesis, setTesis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoActivo, setEstadoActivo] = useState(2);

  //  Filtros
  const [buscar, setBuscar] = useState('');
  const buscarDebounced = useDebounce(buscar, 500);
  const [carreras, setCarreras] = useState([]);
  const [carreraSeleccionadas, setCarreraSeleccionadas] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [anioSeleccionados, setAnioSeleccionados] = useState([]);
  const [orden, setOrden] = useState('reciente');
  const [showFiltros, setShowFiltros] = useState(false);

  //  Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const limit = 30;

  //  Modales
  const [modalRechazo, setModalRechazo] = useState(null);
  const [comentarioRechazo, setComentarioRechazo] = useState('');

  // Cargar carreras y años al inicio
  useEffect(() => {
    cargarCarreras();
    cargarAnios();
  }, []);

  // Cargar tesis cuando cambien los filtros
  useEffect(() => {
    cargarTesis();
  }, [estadoActivo, buscarDebounced, carreraSeleccionadas, anioSeleccionados, orden, page]);

  // Resetear page cuando cambia algún filtro
  useEffect(() => {
    setPage(1);
  }, [buscarDebounced, carreraSeleccionadas, anioSeleccionados, orden, estadoActivo]);

  const cargarCarreras = async () => {
    try {
      const data = await carrerasApi.getAll();
      setCarreras(data);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarAnios = async () => {
    try {
      const res = await tesisApi.getAniosDisponibles();
      setAniosDisponibles(res || []);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarTesis = async () => {
    setLoading(true);
    try {
      const res = await tesisApi.listarGestion({
        buscar: buscarDebounced,
        id_carrera: carreraSeleccionadas.length ? carreraSeleccionadas : undefined,
        anio: anioSeleccionados.length ? anioSeleccionados : undefined,
        estado: estadoActivo,
        orden,
        page,
        limit,
      });

      console.log(res)
      setTesis(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
      setTotalResultados(res.pagination?.total || 0);
    } catch (error) {
      toast.error('Error al cargar las tesis');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id, titulo) => {
    const confirmed = await showConfirmAlert(
      'Aprobar proyecto',
      `¿Estás seguro de aprobar el proyecto "${titulo}"?`
    );

    if (!confirmed) return;

    try {
      const res = await tesisApi.revisar(id, true, 'Aprobada por el revisor');
      if (res.success) {
        showSuccessAlert(res.message);
        window.dispatchEvent(new Event('tesis-revisada'));
        cargarTesis();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Error al aprobar la tesis');
    }
  };

  const handleRechazar = async () => {
    if (!comentarioRechazo.trim()) {
      toast.error('Debes indicar el motivo del rechazo');
      return;
    }
    try {
      const res = await tesisApi.revisar(modalRechazo.id, false, comentarioRechazo);
      if (res.success) {
        showSuccessAlert(res.message);
        setModalRechazo(null);
        setComentarioRechazo('');
        window.dispatchEvent(new Event('tesis-revisada'));
        cargarTesis();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Error al rechazar la tesis');
    }
  };

  const filtrosActivos =
    (buscar ? 1 : 0) +
    carreraSeleccionadas.length +
    anioSeleccionados.length +
    (orden !== 'reciente' ? 1 : 0);

  const estadoActual = TABS.find(t => t.id === estadoActivo);

  const opcionesCarreras = carreras.map(c => ({
    value: c.id_carrera,
    label: c.nombre,
  }));


  const opcionesAnios = aniosDisponibles.map(a => ({
    value: a,
    label: a.toString(),
  }));


  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Proyectos</h1>
        <p className="text-gray-500 text-sm">Revisa, aprueba o rechaza los proyectos enviados</p>
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
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition whitespace-nowrap border-b-2 ${activo ? `${tab.color} border-current` : 'text-gray-400 border-transparent hover:text-gray-600'
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
          className={`px-4 py-3 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${showFiltros ? 'bg-cyan-500 text-white' : 'bg-white border border-gray-200 text-gray-700'
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

        {/* Ordenamiento */}
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
      {showFiltros && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Filtro de carreras (multiselect con búsqueda) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Carreras
              </label>
              <Select
                isMulti
                isClearable
                isSearchable
                options={opcionesCarreras}
                value={opcionesCarreras.filter(o =>
                  carreraSeleccionadas.includes(o.value)
                )}
                onChange={(selected) => {
                  setCarreraSeleccionadas(
                    selected ? selected.map(s => s.value) : []
                  );
                  setPage(1);
                }}
                placeholder="Todas las carreras"
                noOptionsMessage={() => 'No hay carreras'}
              // styles={selectStyles}
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
                  anioSeleccionados.includes(o.value)
                )}
                onChange={(selected) => {
                  setAnioSeleccionados(
                    selected ? selected.map(s => s.value) : []
                  );
                  setPage(1);
                }}
                placeholder="Todos los años"
                noOptionsMessage={() => 'No hay años'}
              // styles={selectStyles}
              />
            </div>
          </div>

          {/* Filtros activos con botón de limpiar */}
          {(carreraSeleccionadas.length > 0 || anioSeleccionados.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {carreraSeleccionadas.length + anioSeleccionados.length} filtro(s) activo(s)
              </p>
              <button
                onClick={() => {
                  setCarreraSeleccionadas([]);
                  setAnioSeleccionados([]);
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
          Mostrando <span className="font-semibold text-gray-700">{tesis.length}</span> de{' '}
          <span className="font-semibold text-gray-700">{totalResultados}</span> resultados
        </p>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      ) : tesis.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          {estadoActual && <estadoActual.icon className={`h-16 w-16 mx-auto mb-3 ${estadoActual.color} opacity-50`} />}
          <p className="text-gray-500 text-lg">
            No hay proyectos {estadoActual?.label.toLowerCase()}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {estadoActivo === 2 ? '¡Todo al día!' : 'Prueba con otro filtro'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tesis.map((item) => (
            <div key={item.id_tesis} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.titulo}</h3>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {item.nombre_carrera}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {item.nombre_creador || 'Anónimo'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {item.anio_elaboracion}
                    </span>
                  </div>

                  {item.estudiantes && item.estudiantes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Autores:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.estudiantes.map((est, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                            {est.nombre_completo} ({est.cedula})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.comentario_revision && estadoActivo !== 2 && (
                    <div className={`mt-3 p-3 rounded-lg border-l-4 ${estadoActivo === 1 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
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

                  <p className="text-gray-600 text-sm line-clamp-2 mt-3">{item.resumen}</p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    to={`/proyecto/${item.id_tesis}`}
                    // target="_blank"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1 justify-center"
                  >
                    <Eye className="h-4 w-4" /> Ver
                  </Link>

                  {estadoActivo === 2 && (
                    <>
                      <button
                        onClick={() => handleAprobar(item.id_tesis, item.titulo)}
                        className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1 justify-center"
                      >
                        <CheckCircle className="h-4 w-4" /> Aprobar
                      </button>
                      <button
                        onClick={() => setModalRechazo({ id: item.id_tesis, titulo: item.titulo })}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-1 justify-center"
                      >
                        <XCircle className="h-4 w-4" /> Rechazar
                      </button>
                    </>
                  )}

                  {estadoActivo === 4 && (
                    <button
                      onClick={() => handleAprobar(item.id_tesis, item.titulo)}
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

      {/* 👇 Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Números de página */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => {
                // Mostrar solo páginas cercanas a la actual
                return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
              })
              .map((p, idx, arr) => {
                // Agregar "..." si hay saltos
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg font-medium transition ${page === p
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
              <h3 className="text-lg font-bold">Rechazar proyecto</h3>
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