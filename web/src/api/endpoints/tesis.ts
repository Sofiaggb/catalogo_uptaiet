import { apiClient } from '../client';

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

  
  getAniosDisponibles: async () => {
    const response = await apiClient.get('/tesis/anios');
    return response.data || [];
  },
};