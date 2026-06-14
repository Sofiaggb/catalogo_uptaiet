import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Book, User, Building, Calendar, X, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { librosApi } from '../../api/endpoints/libros';
import { materiasApi } from '../../api/endpoints/materias';
import type { Libros, Materia } from '../../api/types';
import { useDebounce } from '../../hooks/useDebounce';

// Componente de tarjeta de libro
const LibroCard = ({ libro }: { libro: Libros; onRefresh: () => void }) => {

  return (
    <Link to={`/libros/${libro.id_libro}`} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Book className="h-5 w-5 text-cyan-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-cyan-600 transition line-clamp-1">
              {libro.titulo}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {libro.autor && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                <User className="h-3 w-3" />
                {libro.autor}
              </span>
            )}
            {libro.editorial && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                <Building className="h-3 w-3" />
                {libro.editorial}
              </span>
            )}
            {libro.year && (
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                <Calendar className="h-3 w-3" />
                {libro.year}
              </span>
            )}
          </div>
          
          {libro.materia && (
            <p className="text-xs text-gray-400">
              {libro.materia}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export function LibrosList() {
  const { isAuthenticated , user} = useAuth();
  const [libros, setLibros] = useState<Libros[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const buscarDebounced = useDebounce(searchText, 500);
  const totalFiltrosActivos = materiasSeleccionadas.length + (searchText ? 1 : 0);

  useEffect(() => {
    cargarMaterias();
    cargarLibros();
  }, []);

  // useEffect(() => {
  //   setPage(1);
  //   cargarLibros();
  // }, [searchText, materiasSeleccionadas]);

    useEffect(() => {
    if (page === 1) {
      cargarLibros();
    }
  }, [buscarDebounced, page, materiasSeleccionadas]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setPage(1);
  };

  const cargarMaterias = async () => {
    const data = await materiasApi.getAll();
    setMaterias(data);
  };

  const cargarLibros = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const data = await librosApi.getAll({
      buscar: searchText || undefined,
      id_materia: materiasSeleccionadas.length > 0 ? materiasSeleccionadas.join(',') : undefined,
      page: isLoadMore ? page : 1,
      limit: 12
    });

    const librosData = Array.isArray(data?.data) ? data.data : [];
    
    if (data?.pagination) {
      setTotalPages(data.pagination.pages);
    }

    if (isLoadMore) {
      setLibros(prev => [...prev, ...librosData]);
      setLoadingMore(false);
    } else {
      setLibros(librosData);
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      setPage(prev => prev + 1);
      cargarLibros(true);
    }
  };

  const toggleMateria = (id: number) => {
    setMateriasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const limpiarFiltros = () => {
    setMateriasSeleccionadas([]);
    setSearchText('');
  };

  if (loading && libros.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 ml-3">Cargando libros...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen">
      {/* Header con gradiente */}
      <div className="bg-linear-to-r from-cyan-600 to-blue-600 mt-1 -mx-4 px-5 py-8 mb-6
       rounded-2xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Libros</h1>
          <p className="text-white/80">Explora nuestra colección de libros y materiales de apoyo</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Buscar por título, autor o editorial..."
              value={searchText}
              onChange={handleSearchChange}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition ${
              showFilters ? 'bg-cyan-500 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            <Filter className="h-5 w-5" />
            Filtros
            {totalFiltrosActivos > 0 && (
              <span className="bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalFiltrosActivos}
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 p-5 bg-white border border-gray-200 rounded-xl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Materias</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                <button
                  onClick={() => setMateriasSeleccionadas([])}
                  className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Todas
                </button>
                {materias.map((materia) => (
                  <button
                    key={materia.id_materia}
                    onClick={() => toggleMateria(materia.id_materia)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      materiasSeleccionadas.includes(materia.id_materia)
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {materia.nombre}
                  </button>
                ))}
              </div>
            </div>
            
            {totalFiltrosActivos > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {materiasSeleccionadas.map(id => {
                    const materia = materias.find(m => m.id_materia === id);
                    return (
                      <span key={id} className="flex items-center gap-1 bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-sm">
                        {materia?.nombre}
                        <button onClick={() => toggleMateria(id)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                  <button
                    onClick={limpiarFiltros}
                    className="text-sm text-red-500 hover:text-red-600 underline"
                  >
                    Limpiar todos
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-500">
          {libros.length} libro{libros.length !== 1 ? 's' : ''} encontrado{libros.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid de libros */}
      {libros.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {libros.map((libro) => (
              <LibroCard key={libro.id_libro} libro={libro} onRefresh={() => {
                setPage(1);
                cargarLibros();
              }} />
            ))}
          </div>
          
          {/* Botón cargar más */}
          {page < totalPages && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                    Cargando...
                  </div>
                ) : (
                  'Cargar más libros'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Book className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron libros</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchText || materiasSeleccionadas.length > 0
              ? 'Prueba con otros filtros'
              : 'Aún no hay libros disponibles'}
          </p>
        </div>
      )}

      {/* Botón flotante para crear - solo usuarios autenticados */}
      {isAuthenticated  && [2, 3, 4].includes(user?.id_rol) && (
        <Link
          to="/libros/create"
          className="fixed bottom-6 right-6 bg-cyan-500 rounded-full p-4 shadow-lg hover:bg-cyan-600 transition-all hover:scale-105 z-10"
        >
          <Plus className="h-6 w-6 text-white" />
        </Link>
      )}
    </div>
  );
}