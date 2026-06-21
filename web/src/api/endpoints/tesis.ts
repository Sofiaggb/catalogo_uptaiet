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

};