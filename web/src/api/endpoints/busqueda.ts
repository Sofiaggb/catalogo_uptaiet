import { apiClient } from '../client';

export const busquedaApi = {
  buscarPorCedula: async (tipo: 'estudiante' | 'jurado', cedula: string) => {
    try {
      return await apiClient.get(`/tesis/${tipo}s/cedula/${cedula}`);
      
     
    } catch (error: any) {
      // Si es error 404, no hay resultados
      if (error?.message?.includes('404') || error?.status === 404) {
        return { success: false, data: null, error: 'No encontrado' };
      }
      console.error(`Error buscando ${tipo}:`, error);
      return { success: false, error: 'Error de conexión', data: null };
    }
  },
};