// services/api/endpoints/busqueda.ts
import { apiClient } from '../client';

export const busquedaApi = {
    buscarPorCedula: async (tipo: 'estudiante' | 'jurado', cedula: string) => {
        try {
            return await apiClient.get(`/tesis/${tipo}s/cedula/${cedula}`);
        } catch (error) {
            if ((error as any).message?.includes('404')) {
                return { success: false, data: null, error: 'No encontrado' };
            }
            console.error(`Error buscando ${tipo}:`, error);
            return { success: false, error: 'Error de conexión', data: null };
        }
    },

};