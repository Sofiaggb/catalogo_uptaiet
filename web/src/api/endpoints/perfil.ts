import { apiClient } from '../client';

export const perfilApi = {
  getMe: async () => {
    return await apiClient.get('/perfil/me');
  },
  
  // Obtener estado de solicitud
  obtenerEstadoSolicitud: async () => {
    return await apiClient.get('/perfil/solicitud-estado');
  },
  
  // Enviar solicitud de cambio de rol
  enviarSolicitudCambioRol: async (data: { id_rol: number; cedula:string;
    nombre_completo:string ;justificacion: string }) => {
    return await apiClient.post('/perfil/solicitar-cambio-rol', data);
  },
  
  // Obtener perfil
  obtenerPerfil: async () => {
    return await apiClient.get('/perfil/me');
  },
  
  // Actualizar perfil
  actualizarPerfil: async (data: { nombre?: string; email?: string }) => {
    return await apiClient.put('/perfil/me', data);
  },

    // Obtener roles disponibles
  obtenerRolesDisponibles: async () => {
    return await apiClient.get('/auth/roles');
  },


    // Subir foto de perfil
    subirFotoPerfil: async (formData: FormData)  : Promise<any>=> {
        return apiClient.upload('/perfil/foto', formData);
    },
    
    // Obtener foto de perfil
    obtenerFotoPerfil: async () => {
        return await apiClient.get('/perfil/foto');
    },
    
    // Eliminar foto de perfil
    eliminarFotoPerfil: async () => {
        return await apiClient.delete('/perfil/foto');
    },
};