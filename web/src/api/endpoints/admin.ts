import { apiClient } from '../client';

export const adminApi = {
  // Obtener todas las solicitudes
  obtenerSolicitudesRol: async (params?: { estado?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/admin/solicitudes-rol${queryParams.toString() ? `?${queryParams}` : ''}`;
    return await apiClient.get(url);
  },
  
  // Obtener una solicitud específica
  obtenerSolicitudById: async (id: number) => {
    return await apiClient.get(`/admin/solicitudes-rol/${id}`);
  },
  
  // Aprobar solicitud
  aprobarSolicitudRol: async (id: number, comentario?: string) => {
    return await apiClient.put(`/admin/solicitudes-rol/${id}/aprob ar`, { comentario });
  },
  
  // Rechazar solicitud
  rechazarSolicitudRol: async (id: number, comentario?: string) => {
    return await apiClient.put(`/admin/solicitudes-rol/${id}/rechazar`, { comentario });
  },
  
  // Obtener estadísticas
  obtenerEstadisticas: async () => {
    return await apiClient.get('/admin/solicitudes-rol/estadisticas');
  },
};