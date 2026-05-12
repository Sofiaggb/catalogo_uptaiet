// services/api/endpoints/tesis.ts
import { apiClient } from '../client';
import type { 
    Tesis, 
    PaginatedResponse,
    ListarTesisParams
} from '../types';

export const tesisApi = {
    // Listar tesis con filtros
    listar: async (params: ListarTesisParams = {}): Promise<PaginatedResponse<Tesis>> => {
        const queryParams = new URLSearchParams();
        if (params.id_carrera) queryParams.append('id_carrera', params.id_carrera.toString());
        if (params.id_estado) queryParams.append('id_estado', params.id_estado.toString());
        if (params.anio) queryParams.append('anio', params.anio.toString());
        if (params.buscar) queryParams.append('buscar', params.buscar);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        
        const url = `/tesis${queryParams.toString() ? `?${queryParams}` : ''}`;
        return apiClient.get<PaginatedResponse<Tesis>>(url);
    },

    // Obtener por ID
    getById: async (id: number): Promise<any> => {
        return apiClient.get(`/tesis/byId/${id}`);
    },

    // Crear tesis
    crear: async (formData: FormData): Promise<any> => {
        return apiClient.upload('/tesis/save', formData);
    },

    // Actualizar tesis
    actualizar: async (id: number, formData: FormData): Promise<any> => {
        return apiClient.uploadPut(`/tesis/upload/${id}`, formData);
    },

    // Eliminar (soft delete)
    eliminar: async (id: number, forzarFisico: boolean = false): Promise<any> => {
        const url = `/tesis/${id}${forzarFisico ? '?forzar_fisico=true' : ''}`;
        return apiClient.delete(url);
    },

    // Restaurar tesis
    // restaurar: async (id: number): Promise<any> => {
    //     return apiClient.patch(`/tesis/${id}/restaurar`);
    // },

    // Obtener años disponibles
    getAniosDisponibles: async (): Promise<number[]> => {
        const response = await apiClient.get<{ success: boolean; data: number[] }>('/tesis/anios');
        return response.success ? response.data : [];
    },
};