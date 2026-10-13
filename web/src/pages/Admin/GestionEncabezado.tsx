import { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { headerService } from '../../api/endpoints/header';
import { STATIC_URL } from '../../api/client';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../helpers/alerts';

export function GestionEncabezado() {
  const [headerData, setHeaderData] = useState({
    imagen: null as string | null,
    texto: { titulo: '', subtitulo: '' }
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'imagen' | 'texto' | null>(null);

  useEffect(() => {
    cargarEncabezado();

    // Cleanup para evitar memory leaks
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const cargarEncabezado = async () => {
    try {
      const response = await headerService.obtenerEncabezado();
      //   console.log(response)
      if (response.success) {
        setHeaderData({
          imagen: response.data.imagen,
          texto: response.data.texto || { titulo: '', subtitulo: '' }
        });
      }
    } catch (error) {
      console.error('Error al cargar encabezado:', error);
      showErrorAlert('Error al cargar encabezado intenta más tarde')
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Crear preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubirImagen = async () => {
    if (!selectedFile) return;

    // Validar formato
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.includes(selectedFile.type);
    const isValidExtension = allowedExtensions.includes(fileExtension);
    const isValidSize = selectedFile.size <= maxSize;

    if (!isValidType || !isValidExtension) {
      showErrorAlert('Formato no válido. Solo se permiten: JPG, PNG, GIF, WEBP');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!isValidSize) {
      showErrorAlert('El archivo es demasiado grande. Máximo 5MB');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('encabezado', selectedFile);

    try {
      const response = await headerService.actualizarImagenEncabezado(formData);
      //   console.log(response)
      if (response.success) {
        await cargarEncabezado();
        setSelectedFile(null);
        setPreviewUrl(null);
        setEditMode(null);
        showSuccessAlert('Imagen actualizada correctamente');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      showErrorAlert(' Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarImagen = async () => {
    const confirmed = await showConfirmAlert(
      'Eliminar Imagen',
      `¿Estás seguro de eliminar la imagen del encabezado?`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await headerService.eliminarEncabezado();
      if (response.success) {
        await cargarEncabezado();
        showSuccessAlert('Imagen eliminada correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      showErrorAlert('Error al eliminar la imagen');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-cyan-600 to-blue-600 mt-1 -mx-4 px-5 py-8 mb-6 rounded-2xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Encabezado</h1>
          <p className="text-white/80">Personaliza la imagen del encabezado del sitio</p>
        </div>
      </div>

      {/* Vista previa actual */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Vista previa actual</h2>
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          {headerData.imagen ? (
            <div className="relative">
              <img
                src={`${STATIC_URL}${headerData.imagen} `}
                alt="Encabezado actual"
                className="w-full h-16 md:h-20 "
              />
            </div>
          ) : (
            <div className="h-28 md:h-32 flex items-center justify-center bg-linear-to-r from-cyan-500 to-blue-500">
              <div className="text-center text-white">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg font-semibold">Sin imagen configurada</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Opciones de edición */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestión de imagen */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-cyan-600" />
            Imagen del encabezado
          </h2>

          {editMode === 'imagen' ? (
            <div className="space-y-4">
              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-28 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSubirImagen}
                  disabled={!selectedFile || loading}
                  className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Subiendo...'
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Subir imagen
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditMode(null);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setEditMode('imagen')}
                  className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
                >
                  <Upload className="h-4 w-4" />
                  Cambiar imagen
                </button>

                {headerData.imagen && (
                  <button
                    onClick={handleEliminarImagen}
                    disabled={loading}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar imagen
                  </button>
                )}
              </div>

              {headerData.imagen && (
                <p className="text-xs text-gray-500">
                  Imagen actual: {headerData.imagen.split('/').pop()}
                </p>
              )}

              <div className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                <p>Formatos permitidos: JPG, PNG, WEBP, GIF</p>
                <p>Tamaño máximo: 5MB</p>
              </div>
            </div>
          )}
        </div>


        {/* Consejos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Consejos para el encabezado</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Usa imágenes de alta calidad con resolución mínima de 1920x200px</li>
            <li>• El título y subtítulo deben ser concisos y representativos</li>
            <li>• La imagen se mostrará en todo el ancho del encabezado</li>
            <li>• Si no hay imagen, se usará el color de fondo predeterminado</li>
          </ul>
        </div>
      </div>

    </div>
  );
}