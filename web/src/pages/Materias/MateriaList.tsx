import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, BookOpen, Edit, Trash2, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { materiasApi } from '../../api/endpoints/materias';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../../helpers/alerts';
import type { Materia } from '../../api/types';

// Componente de tarjeta de materia
const MateriaCard = ({ materia, onRefresh }: { materia: Materia; onRefresh: () => void }) => {
  const handleEdit = () => {
    window.location.href = `/materias/edit/${materia.id_materia}`;
  };

  const handleDelete = async () => {
    const confirmed = await showConfirmAlert(
      'Eliminar Materia',
      `¿Estás seguro de eliminar "${materia.nombre}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (confirmed) {
      const success = await materiasApi.delete(materia.id_materia);
      if (success) {
        showSuccessAlert('Materia eliminada correctamente', onRefresh);
      } else {
        showErrorAlert('No se pudo eliminar la materia');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-cyan-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-cyan-600 transition line-clamp-1">
              {materia.nombre}
            </h3>
          </div>
          
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleEdit}
            className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition"
            title="Editar"
          >
            <Edit className="h-4 w-4 text-yellow-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export function MateriasList() {
  const { isAuthenticated } = useAuth();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [filteredMaterias, setFilteredMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    cargarMaterias();
  }, []);

  useEffect(() => {
    filtrarMaterias();
  }, [searchText, materias]);

  const cargarMaterias = async () => {
    setLoading(true);
    const data = await materiasApi.getAll();
    setMaterias(data);
    setFilteredMaterias(data);
    setLoading(false);
  };

  const filtrarMaterias = () => {
    let filtered = [...materias];
    
    if (searchText.trim()) {
      filtered = filtered.filter(m =>
        m.nombre.toLowerCase().includes(searchText.toLowerCase()) 
      );
    }
    
    setFilteredMaterias(filtered);
  };

  if (loading && materias.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 ml-3">Cargando materias...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 mt-1 -mx-4 px-5 py-8 mb-6 rounded-2xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Materias</h1>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Buscar materia por nombre o código..."
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
          {filteredMaterias.length} materia{filteredMaterias.length !== 1 ? 's' : ''} encontrada
          {filteredMaterias.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid de materias */}
      {filteredMaterias.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterias.map((materia) => (
            <MateriaCard key={materia.id_materia} materia={materia} onRefresh={cargarMaterias} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron materias</p>
          <p className="text-gray-400 text-sm mt-1">Intenta con otros términos de búsqueda</p>
        </div>
      )}

      {/* Botón flotante para crear */}
      {isAuthenticated && (
        <Link
          to="/materias/create"
          className="fixed bottom-6 right-6 bg-cyan-500 rounded-full p-4 shadow-lg hover:bg-cyan-600 transition-all hover:scale-105 z-10"
        >
          <Plus className="h-6 w-6 text-white" />
        </Link>
      )}
    </div>
  );
}