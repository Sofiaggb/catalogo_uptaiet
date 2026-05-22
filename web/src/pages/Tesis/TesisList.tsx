import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search,  Plus, BookOpen, Eye, Calendar, TrendingUp, Grid3x3, List, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { tesisApi } from '../../api/endpoints/tesis';
import { carrerasApi } from '../../api/endpoints/carreras';

interface Tesis {
  id_tesis: number;
  titulo: string;
  resumen_corto?: string;
  nombre_carrera?: string;
  promedio_nota?: number;
  anio_elaboracion?: number;
}

export function TesisList() {
  const { isAuthenticated } = useAuth();
  const [tesis, setTesis] = useState<Tesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [carreras, setCarreras] = useState<any[]>([]);
  const [carrerasSeleccionadas, setCarrerasSeleccionadas] = useState<number[]>([]);
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
  const [aniosSeleccionados, setAniosSeleccionados] = useState<number[]>([]);
  const [buscar, setBuscar] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('reciente');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    cargarCarreras();
    cargarAnios();
  }, []);

  useEffect(() => {
    cargarTesis();
  }, [page, carrerasSeleccionadas, aniosSeleccionados, buscar]);

  const cargarCarreras = async () => {
    const data = await carrerasApi.getAll();
    setCarreras(data);
  };

  const cargarAnios = async () => {
    const years = await tesisApi.getAniosDisponibles();
    setAniosDisponibles(years);
  };

  const cargarTesis = async () => {
    setLoading(true);
    const params: any = { page, limit: 10 };
    if (carrerasSeleccionadas.length) params.id_carrera = carrerasSeleccionadas.join(',');
    if (aniosSeleccionados.length) params.anio = aniosSeleccionados.join(',');
    if (buscar) params.buscar = buscar;
    
    const result = await tesisApi.listar(params);
    console.log(result)
    if (result.success) {
      setTesis(prev => page === 1 ? result.data : [...prev, ...result.data]);
      setTotalPages(result.pagination.pages);
    }
    setLoading(false);
  };

  const toggleCarrera = (id: number) => {
    setCarrerasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
    setPage(1);
  };

    const toggleAnio = (anio: number) => {
    setAniosSeleccionados(prev =>
      prev.includes(anio) ? prev.filter(a => a !== anio) : [...prev, anio]
    );
    setPage(1);
  };

  const limpiarFiltros = () => {
    setCarrerasSeleccionadas([]);
    setAniosSeleccionados([]);
    setBuscar('');
    setPage(1);
  };

  const totalFiltrosActivos = carrerasSeleccionadas.length + aniosSeleccionados.length + (buscar ? 1 : 0);

  if (loading && page === 1 && tesis.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 mt-4">Cargando proyectos...</p>
      </div>
    );
  }



  const TesisCard = ({ item }: { item: any }) => (
    <Link
      to={`/proyecto/${item.id_tesis}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-cyan-600 transition">
          {item.titulo}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <BookOpen className="h-4 w-4" />
          <span>{item.nombre_carrera}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {item.resumen_corto || 'Sin resumen disponible'}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
           <div className="">
          <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
            ★ {item.promedio_nota || 'Nuevo'}
          </span>
        </div>
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Eye className="h-4 w-4" />
            <span>234 vistas</span>
          </div>
          
         
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{item.anio_elaboracion || 2024}</span>
          </div>
        </div>
      </div>
    </Link>
  );

  const TesisListItem = ({ item }: { item: any }) => (
    <Link
      to={`/proyecto/${item.id_tesis}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition group"
    >
      <div className="flex gap-4">
       <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-cyan-600 transition">
                {item.titulo}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">{item.nombre_carrera}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">{item.anio_elaboracion || 2024}</span>
              </div>
            </div>
            <div className="bg-yellow-50 px-2 py-1 rounded-full">
              <span className="text-xs font-semibold text-yellow-600">
                ★ {item.promedio_nota || 'Nuevo'}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {item.resumen_corto || 'Sin resumen disponible'}
          </p>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Eye className="h-3 w-3" />
              <span>234 vistas</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>15 descargas</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 mt-1 -mx-4 
      px-5 py-8 mb-6 rounded-2xl ">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Explora Proyectos</h1>
          <p className="text-white/80">Descubre investigaciones y trabajos académicos</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Buscar por título, autor o palabras clave..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 transition ${
                showFilters ? 'bg-cyan-500 text-white' : 'bg-white border border-gray-200 text-gray-700'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filtros
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="reciente">Más reciente</option>
              <option value="vistas">Más visto</option>
              <option value="calificacion">Mejor calificado</option>
            </select>
            
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-gray-500'}`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-gray-500'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Carreras</label>
                <div className="flex flex-wrap gap-2">
                  {carreras.map((carrera) => (
                    <button
                      key={carrera.id_carrera}
                      onClick={() => toggleCarrera(carrera.id_carrera)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        carrerasSeleccionadas.includes(carrera.id_carrera)
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {carrera.nombre}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Años</label>
                <div className="flex flex-wrap gap-2">
                  {aniosDisponibles.map((anio) => (
                    <button
                      key={anio}
                      onClick={() => toggleAnio(anio)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        aniosSeleccionados.includes(anio)
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {anio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-500">
          Mostrando <span className="font-semibold text-gray-700">{tesis.length}</span> resultados
        </p>
        {tesis.length > 0 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-cyan-600 hover:underline text-sm"
          >
            Volver arriba ↑
          </button>
        )}
      </div>

      {/* Lista de tesis en grid o lista */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tesis.map((item) => (
            <TesisCard key={item.id_tesis} item={item} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tesis.map((item) => (
            <TesisListItem key={item.id_tesis} item={item} />
          ))}
        </div>
      )}

      {/* Botón flotante para crear */}
      {isAuthenticated && (
        <Link
          to="/proyecto/create"
          className="fixed bottom-6 right-6 bg-cyan-500 rounded-full p-4 shadow-lg hover:bg-cyan-600 transition"
        >
          <Plus className="h-6 w-6 text-white" />
        </Link>
       )} 
    </div>
  );
}