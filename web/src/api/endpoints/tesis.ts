import { apiClient } from '../client';
const API_URL = import.meta.env.VITE_API_URL

export const tesisApi = {
  listar: async (params: any) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/tesis${queryParams ? `?${queryParams}` : ''}`);
  },


  // Obtener por ID
  getById: async (id: number): Promise<any> => {
    return apiClient.get(`/tesis/byId/${id}`);
  },

  // Crear tesis (con archivo)
  crear: async (formData: FormData): Promise<any> => {
    return apiClient.upload('/tesis/save', formData);
  },

  // Actualizar tesis (con archivo)
  actualizar: async (id: number, formData: FormData): Promise<any> => {
    return apiClient.uploadPut(`/tesis/upload/${id}`, formData);
  },

  // Incrementar vistas de una tesis
  incrementarVistas: async (id: number): Promise<any> => {
    return await apiClient.post(`/tesis/vistas/${id}`);
  },

  getAniosDisponibles: async () => {
    const response = await apiClient.get('/tesis/anios');
    return response.data || [];
  },

  // Abrir visor de PDF protegido
  abrirVisorPDF: (id: number): void => {
    const url = `${API_URL}/download/tesis/${id}`;
    window.open(url, '_blank');
  },

  listarGestion: async (params: any = {}) => {
    const queryParams = new URLSearchParams();

    if (params.buscar) queryParams.append('buscar', params.buscar);
    if (params.id_carrera) queryParams.append('id_carrera', params.id_carrera.toString());
    if (params.anio) queryParams.append('anio', params.anio.toString());
    if (params.estado) queryParams.append('estado', params.estado.toString());
    if (params.orden) queryParams.append('orden', params.orden);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    return await apiClient.get(`/tesis/gestion${queryString ? `?${queryString}` : ''}`);
  },

  revisar: async (id, aprobar, comentario = null) => {
    return await apiClient.put(`/tesis/revisar/${id}`, { aprobar, comentario });
  },

  contarPendientes: async () => {
    return await apiClient.get('/tesis/pendientes/count');
  },

};