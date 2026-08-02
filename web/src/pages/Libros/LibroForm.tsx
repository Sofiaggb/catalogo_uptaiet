import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Book, User, Building, Calendar, Upload, FileText } from 'lucide-react';
import { librosApi } from '../../api/endpoints/libros';
import { materiasApi } from '../../api/endpoints/materias';
import { showSuccessAlert, showErrorAlert } from '../../helpers/alerts';
import type { Materia } from '../../api/types';

export function LibroForm({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = mode === 'edit';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [form, setForm] = useState({
    titulo: '',
    autor: '',
    editorial: '',
    id_materia: '',
    year: '',
    descripcion: '',
  });

  const [documento, setDocumento] = useState<File | null>(null);
  const [documentoOriginal, setDocumentoOriginal] = useState('');
  const [errors, setErrors] = useState({
    titulo: '',
    autor: '',
    editorial: '',
    id_materia: '',
    year: '',
    documento: '',

  });

  // Generar años disponibles
  const aniosDisponibles = (() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear + 1; i >= 1600; i--) {
      years.push(i);
    }
    return years;
  })();

  useEffect(() => {
    cargarMaterias();
    if (isEditing && id) {
      cargarLibro();
    }
  }, []);

  const cargarMaterias = async () => {
    const data = await materiasApi.getAll();
    setMaterias(data);
  };

  const cargarLibro = async () => {
    const data = await librosApi.getById(Number(id));
    if (data.success && data.data) {
      const libro = data.data;
      setForm({
        titulo: libro.titulo || '',
        autor: libro.autor || '',
        editorial: libro.editorial || '',
        id_materia: libro.id_materia?.toString() || '',
        year: libro.year?.toString() || '',
        descripcion: libro.descripcion || '',
      });
      setDocumentoOriginal(libro.url_documento || '');
    }
    setLoadingData(false);
  };




  // Función para abrir el selector de archivos
  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Función para manejar la selección del archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  // Función para validar y establecer el archivo
// Función de validación unificada
const validateAndSetFile = (file: File) => {
  // Limpiar errores anteriores
  setErrors(prev => ({ ...prev, documento: undefined }));

  // 1. Validar que no sea un archivo fantasma/sin permisos (size === 0)
  if (file.size === 0) {
    setErrors(prev => ({ 
      ...prev, 
      documento: 'No se pudo leer el archivo arrastrado (0 bytes). Por favor, haz clic en el área para seleccionarlo directamente.' 
    }));
    setDocumento(null);
    return false;
  }
  
  // 2. Validar que sea PDF
  const isPdfType = file.type === 'application/pdf';
  const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');

  if (!isPdfType && !isPdfExtension) {
    setErrors(prev => ({ 
      ...prev, 
      documento: 'Solo se permiten archivos PDF' 
    }));
    setDocumento(null);
    return false;
  }
  
  // 3. Validar tamaño máximo (10MB)
  const maxSizeMB = 20;
  const fileSizeMB = file.size / 1024 / 1024;
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    setErrors(prev => ({ 
      ...prev, 
      documento: `El archivo no puede superar los ${maxSizeMB}MB (actual: ${fileSizeMB.toFixed(2)} MB)` 
    }));
    setDocumento(null);
    return false;
  }
  
  // Si todo es válido
  setDocumento(file);
  setErrors(prev => ({ ...prev, documento: undefined }));
  console.log(`Archivo válido: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);
  return true;
};


  // Manejadores de eventos para drag & drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragOver(false);
};

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const newErrors: any = {};
    if (!form.titulo.trim()) newErrors.titulo = 'El título es obligatorio';
    if (!form.autor.trim()) newErrors.autor = 'El autor es obligatorio';
    if (!form.editorial.trim()) newErrors.editorial = 'La editorial es obligatoria';
    if (!form.id_materia) newErrors.id_materia = 'Selecciona una materia';
    if (!form.year) newErrors.year = 'El año es obligatorio';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('titulo', form.titulo);
    formData.append('autor', form.autor);
    formData.append('editorial', form.editorial);
    formData.append('id_materia', form.id_materia);
    formData.append('year', form.year);
    if (form.descripcion) formData.append('descripcion', form.descripcion);

    if (documento) {
      formData.append('archivo_pdf', documento);
    } else if (isEditing && documentoOriginal) {
      formData.append('mantener_documento', 'true');
      formData.append('url_documento_original', documentoOriginal);
    }

    let result;
    if (isEditing && id) {
      result = await librosApi.update(Number(id), formData);
    } else {
      result = await librosApi.create(formData);
    }

    setLoading(false);

    if (result.success) {
      showSuccessAlert(
        isEditing ? 'Libro actualizado' : 'Libro creado',
        () => navigate('/libros')
      );
    } else {
      showErrorAlert(result.message || 'Error al guardar');
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-500 ml-3">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/libros')}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Libro' : 'Nuevo Libro'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEditing ? 'Modifica los datos del libro' : 'Completa los datos del nuevo libro'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Título *
          </label>
          <div className="relative">
            <Book className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.titulo ? 'border-red-500' : 'border-gray-300'
                }`}
              value={form.titulo}
              onChange={(e) => {
                setForm({ ...form, titulo: e.target.value });
                setErrors(prev => ({ ...prev, titulo: '' }));
              }}
              placeholder="Ingrese el título del libro"
            />
          </div>
          {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
        </div>

        {/* Autor y Editorial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Autor *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.autor ? 'border-red-500' : 'border-gray-300'
                  }`}
                value={form.autor}
                onChange={(e) => {
                  setForm({ ...form, autor: e.target.value });
                  setErrors(prev => ({ ...prev, autor: '' }));
                }}
                placeholder="Nombre del autor"
              />
            </div>
            {errors.autor && <p className="text-red-500 text-sm mt-1">{errors.autor}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Editorial *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.editorial ? 'border-red-500' : 'border-gray-300'
                  }`}
                value={form.editorial}
                onChange={(e) => {
                  setForm({ ...form, editorial: e.target.value });
                  setErrors(prev => ({ ...prev, editorial: '' }));
                }}
                placeholder="Editorial"
              />
            </div>
            {errors.editorial && <p className="text-red-500 text-sm mt-1">{errors.editorial}</p>}
          </div>
        </div>

        {/* Materia y Año */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Materia *
            </label>
            <select
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.id_materia ? 'border-red-500' : 'border-gray-300'
                }`}
              value={form.id_materia}
              onChange={(e) => {
                setForm({ ...form, id_materia: e.target.value });
                setErrors(prev => ({ ...prev, id_materia: '' }));
              }}
            >
              <option value="">Selecciona una materia</option>
              {materias.map((materia) => (
                <option key={materia.id_materia} value={materia.id_materia}>
                  {materia.nombre}
                </option>
              ))}
            </select>
            {errors.id_materia && <p className="text-red-500 text-sm mt-1">{errors.id_materia}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Año *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                value={form.year}
                onChange={(e) => {
                  setForm({ ...form, year: e.target.value });
                  setErrors(prev => ({ ...prev, year: '' }));
                }}
              >
                <option value="">Selecciona un año</option>
                {aniosDisponibles.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Descripción del libro (opcional)"
          />
        </div>

        {/* Documento PDF */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Documento PDF
          </label>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer
      ${isDragOver
                ? 'border-cyan-500 bg-cyan-50'
                : 'border-gray-300 hover:border-cyan-500'
              }`}
            onClick={handleOpenFileSelector}
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {documento ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-8 w-8 text-green-600" />
                  <span className="text-sm text-gray-600">{documento.name}</span>
                  <span className="text-xs text-gray-400">
                    ({(documento.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumento(null);
                    setErrors(prev => ({ ...prev, documento: undefined }));
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
            ) : documentoOriginal ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    Documento actual: {documentoOriginal.split('/').pop()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-cyan-600 hover:text-cyan-700"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">
                  {isDragOver
                    ? '¡Suelta el archivo aquí!'
                    : 'Arrastra y suelta un archivo PDF o haz clic para seleccionar'
                  }
                </p>
                <p className="text-gray-400 text-sm mt-1">PDF hasta 20MB</p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {errors.documento && (
            <div className="mt-1">
              <p className="text-red-500 text-sm">{errors.documento}</p>
            </div>
          )}
        </div>

        {/* Botón submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isEditing ? 'Actualizar Libro' : 'Crear Libro'}
          </button>
        </div>
      </form>
    </div>
  );
}