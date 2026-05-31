import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, GraduationCap,  BookOpen, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { carrerasApi } from '../../api/endpoints/carreras';
import type { Carrera } from '../../api/types';

// Componente de tarjeta de carrera
const CarreraCard = ({ carrera }: { carrera: Carrera }) => (
  <Link
    to={`/carreras/${carrera.id_carrera}`}
    className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 group"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-cyan-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-cyan-600 transition line-clamp-1">
            {carrera.nombre}
          </h3>
        </div>
        
        {carrera.descripcion && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2">
            {carrera.descripcion}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-3">
          {carrera.tipo_carrera && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
              <BookOpen className="h-3 w-3" />
              {carrera.tipo_carrera}
            </span>
          )}
        </div>
      </div>
    </div>
  </Link>
);

export function CarrerasList() {
  const { isAuthenticated , user} = useAuth();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [filteredCarreras, setFilteredCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    cargarCarreras();
  }, []);

  useEffect(() => {
    filtrarCarreras();
  }, [searchText, carreras]);

  const cargarCarreras = async () => {
    setLoading(true);
    const data = await carrerasApi.getAll();
    setCarreras(data);
    setFilteredCarreras(data);
    setLoading(false);
  };

  const filtrarCarreras = () => {
    if (!searchText.trim()) {
      setFilteredCarreras(carreras);
      return;
    }
    const filtered = carreras.filter(c =>
      c.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCarreras(filtered);
  };

  if (loading && carreras.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 ml-3">Cargando carreras...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-linear-to-r from-cyan-600 to-blue-600 mt-1 -mx-4 px-5 py-8 mb-6
        rounded-2xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Carreras</h1>
          <p className="text-white/80">Explora todas las carreras y programas académicos</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Buscar carrera..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-500">
          {filteredCarreras.length} carrera{filteredCarreras.length !== 1 ? 's' : ''} encontrada
          {filteredCarreras.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid de carreras */}
      {filteredCarreras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCarreras.map((carrera) => (
            <CarreraCard key={carrera.id_carrera} carrera={carrera} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron carreras</p>
          <p className="text-gray-400 text-sm mt-1">Intenta con otros términos de búsqueda</p>
        </div>
      )}

      {/* Botón flotante para crear */}
      {isAuthenticated && [3, 4].includes(user?.id_rol) && (
        <Link
          to="/carreras/create"
          className="fixed bottom-6 right-6 bg-cyan-500 rounded-full p-4 shadow-lg hover:bg-cyan-600 transition-all hover:scale-105 z-10"
        >
          <Plus className="h-6 w-6 text-white" />
        </Link>
      )}
    </div>
  );
}