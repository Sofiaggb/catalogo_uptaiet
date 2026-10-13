import { useState, useEffect, useCallback } from 'react';
import { permisosService } from '../../api/endpoints/permisos';
import toast from 'react-hot-toast';

export function Permisos() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [permisos, setPermisos] = useState([]);
  
  // Paginación y búsqueda
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await permisosService.obtenerUsuarios({ 
        page: currentPage, 
        search: search 
      });
      // Estructura de respuesta del backend: { success, data, count, totalPages, currentPage }
      setUsuarios(res.data);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Error al traer usuarios:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, [currentPage, search]);

  // Cargar cuando cambia la página o la búsqueda
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleSeleccionarUsuario = async (id) => {
    setUsuarioSeleccionado(id);
    try {
      const res = await permisosService.obtenerPermisosUsuario(id);
      setPermisos(res.data); // Extraer el array de la respuesta
    } catch (error) {
      console.error("Error al traer permisos:", error);
    }
  };

 const handleTogglePermiso = async (permiso, estadoActual) => {
    const esDarPermiso = (estadoActual === 'sin_permiso' || estadoActual === 'bloqueado');
    
    try {
      if (esDarPermiso) {
        await permisosService.asignarPermiso(usuarioSeleccionado, permiso.id_permiso);
        toast.success(`Permiso "${permiso.accion}" agregado correctamente`);
      } else {
        await permisosService.bloquearPermiso(usuarioSeleccionado, permiso.id_permiso);
        toast.success(`Permiso "${permiso.accion}" quitado correctamente`);
      }
      
      // Recargar permisos después de cambiar (mueve esto DENTRO del try para que no dé error si falla)
      handleSeleccionarUsuario(usuarioSeleccionado);
    } catch (error) {
      console.error("Error al cambiar permiso:", error);
      toast.error("Ocurrió un problema al cambiar el permiso");
    }
  };


  return (
    <div className="flex gap-6">
      {/* Lista de Usuarios */}
      <div className="w-1/3">
        <h3 className="font-bold mb-4">Usuarios</h3>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // Resetear paginación al buscar
          }}
          className="w-full mb-4 px-3 py-2 border rounded"
        />

        {/* Cargando... */}
        {loadingUsers && <p className="text-sm text-gray-500">Cargando...</p>}

        {/* Lista paginada */}
        <div className="space-y-2">
          {usuarios.map(usuario => (
            <button
              key={usuario.id_usuario}
              onClick={() => handleSeleccionarUsuario(usuario.id_usuario)}
              className={`w-full text-left p-3 rounded border ${usuarioSeleccionado === usuario.id_usuario ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'}`}
            >
              <p className="font-semibold">Usuario: {  usuario.nombre_usuario}</p>
              <p className="">Nombre: {usuario.nombre_completo }</p>
              <p className="text-sm text-gray-500">{usuario.nombre_rol}</p>
            </button>
          ))}
        </div>

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Matriz de Permisos */}
      <div className="w-2/3">
        <h3 className="font-bold mb-4">Permisos</h3>
        
        {!usuarioSeleccionado ? (
          <p className="text-gray-500">Selecciona un usuario para ver sus permisos.</p>
        ) : (
          <>
            {/* MODULOS */}
            {[...new Set(permisos.map(p => p.modulo))].map(modulo => (
              <div key={modulo} className="mb-4">
                <h4 className="font-semibold capitalize mb-2">{modulo}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {permisos.filter(p => p.modulo === modulo).map(permiso => (
                    <div key={permiso.id_permiso} className={`p-3 rounded border ${['sin_permiso', 'bloqueado'].includes(permiso.estado_permiso)  ? 'border-gray-200' : 'border-cyan-500'}`}>
                      <label className="block text-sm font-medium">{permiso.titulo}</label>
                      {/* <p className="text-xs text-gray-500">{permiso.estado_permiso}</p> */}
                      <button
                        onClick={() => handleTogglePermiso(permiso, permiso.estado_permiso)}
                        className={`mt-2 text-xs px-2 py-1 rounded ${['sin_permiso', 'bloqueado'].includes(permiso.estado_permiso)  ? 'bg-cyan-500 text-white' : 'bg-red-500 text-white'}`}
                      >
                        {['sin_permiso', 'bloqueado'].includes(permiso.estado_permiso) ? 'Dar' : 'Quitar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}