import { apiClient } from '../client';

export const profileApi = {
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
};