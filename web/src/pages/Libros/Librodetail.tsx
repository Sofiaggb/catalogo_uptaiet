import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Book, User, Building, Calendar, FileText, Edit,  ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { librosApi } from '../../api/endpoints/libros';

interface LibroDetail {
  id_libro: number;
  titulo: string;
  autor: string;
  editorial: string;
  year: string;
  url_documento: string;
  descripcion: string;
  id_materia: number;
  materia: string;
  fecha_creacion: string;
}

export function LibroDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [libro, setLibro] = useState<LibroDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarLibro();
  }, [id]);

  const cargarLibro = async () => {
    setLoading(true);
    const data = await librosApi.getById(Number(id));
    if (data.success && data.data) {
      setLibro(data.data);
    }
    setLoading(false);
  };

  const handleOpenDocument = () => {
    if (libro?.url_documento) {
      //   URL completa del backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const BASE_URL = API_URL.replace('/api', '');
        const fileUrl = `${BASE_URL}${libro.url_documento}`;
        
        window.open(fileUrl, '_blank');
    }
  };

  const handleEdit = () => {
    navigate(`/libros/edit/${id}`);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 ml-3">Cargando libro...</p>
      </div>
    );
  }

  if (!libro) {
    return (
      <div className="text-center py-20">
        <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">Libro no encontrado</h2>
        <p className="text-gray-500 mt-2">El libro que buscas no existe o ha sido eliminado</p>
        <Link to="/libros" className="inline-block mt-6 text-cyan-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Header con breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/libros" className="hover:text-cyan-600">Libros</Link>
          <span>/</span>
          <span className="text-gray-700 line-clamp-1">{libro.titulo}</span>
        </div>
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <button
            onClick={() => navigate('/libros')}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
          
          {isAuthenticated  && [2, 3, 4].includes(user?.id_rol) && (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-linear-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{libro.titulo}</h1>
        
        <div className="flex flex-wrap gap-3 mt-4">
          {libro.autor && (
            <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
              <User className="h-3 w-3" />
              {libro.autor}
            </span>
          )}
          {libro.editorial && (
            <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
              <Building className="h-3 w-3" />
              {libro.editorial}
            </span>
          )}
          {libro.year && (
            <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
              <Calendar className="h-3 w-3" />
              {libro.year}
            </span>
          )}
        </div>
      </div>

      {/* Contenido del libro */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Información general */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-600" />
            Información general
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Materia</p>
              <p className="text-gray-700 font-medium">{libro.materia || 'No especificada'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Fecha de registro</p>
              <p className="text-gray-700">{new Date(libro.fecha_creacion).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {libro.descripcion && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Descripción</h2>
            <div className="bg-gray-50 rounded-lg p-5">
              <p className="text-gray-700 leading-relaxed">{libro.descripcion}</p>
            </div>
          </div>
        )}

        {/* Botón para abrir documento */}
        {libro.url_documento && (
          <div className="p-6">
            <button
              onClick={handleOpenDocument}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition"
            >
              <ExternalLink className="h-5 w-5" />
              Abrir documento PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}