// services/api/endpoints/materias.ts
import { apiClient } from '../client';
import type { Materia, CrearMateriaInput, ListarMateriasParams } from '../types';

export const materiasApi = {
    // Obtener todas las materias
    getAll: async (params?: ListarMateriasParams): Promise<Materia[]> => {
        const queryParams = new URLSearchParams();
        if (params?.buscar) queryParams.append('buscar', params.buscar);
        
        const url = `/materias${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get<{ success: boolean; data: Materia[] }>(url);
        return response.success ? response.data : [];
    },

    // Obtener materia por ID
    getById: async (id: number): Promise<Materia | null> => {
        const response = await apiClient.get<{ success: boolean; data: Materia }>(`/materias/byId/${id}`);
        return response.success ? response.data : null;
    },

    // Crear materia
    create: async (data: CrearMateriaInput): Promise<any> => {
        return await apiClient.post('/materias/save', data);
    },

    // Actualizar materia
    update: async (id: number, data: Partial<CrearMateriaInput>): Promise<any> => {
        return await apiClient.put(`/materias/update/${id}`, data);
    },

    // Eliminar materia (soft delete)
    delete: async (id: number): Promise<boolean> => {
        const response = await apiClient.delete<{ success: boolean }>(`/materias/${id}`);
        return response.success;
    },
};