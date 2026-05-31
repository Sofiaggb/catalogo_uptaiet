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
    return await apiClient.put(`/admin/solicitudes-rol/${id}/aprobar`, { comentario });
  },
  
  // Rechazar solicitud
  rechazarSolicitudRol: async (id: number, comentario?: string) => {
    return await apiClient.put(`/admin/solicitudes-rol/${id}/rechazar`, { comentario });
  },
  
  // Obtener estadísticas
  obtenerEstadisticas: async () => {
    return await apiClient.get('/admin/solicitudes-rol/estadisticas');
  },

  // ============================================
  // AUDITORÍA
  // ============================================
  
  // Obtener logs de auditoría
obtenerLogsAuditoria: async (params?: { 
  tabla?: string; 
  accion?: string; 
  usuario?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number; 
  limit?: number 
}) => {
  const queryParams = new URLSearchParams();
  if (params?.tabla) queryParams.append('tabla', params.tabla);
  if (params?.accion) queryParams.append('accion', params.accion);
  if (params?.usuario) queryParams.append('usuario', params.usuario);
  if (params?.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
  if (params?.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = `/admin/auditoria/logs${queryParams.toString() ? `?${queryParams}` : ''}`;
  return await apiClient.get(url);
},
  
  // Obtener estadísticas de auditoría
  obtenerEstadisticasAuditoria: async () => {
    return await apiClient.get('/admin/auditoria/estadisticas');
  },
  
  // Obtener acciones disponibles para filtros
  obtenerAccionesAuditoria: async () => {
    return await apiClient.get('/admin/auditoria/acciones');
  },
  
  // Obtener tablas disponibles para filtros
  obtenerTablasAuditoria: async () => {
    return await apiClient.get('/admin/auditoria/tablas');
  },
  
  // ============================================
  // DASHBOARD / ESTADÍSTICAS GENERALES
  // ============================================
  
  // Obtener estadísticas generales del sistema
  obtenerEstadisticasGenerales: async () => {
    return await apiClient.get('/admin/auditoria/estadisticas');
  }
};