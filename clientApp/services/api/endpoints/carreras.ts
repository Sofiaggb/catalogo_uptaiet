// services/api/endpoints/carreras.ts
import { apiClient } from '../client';
import type { Carrera } from '../types';

export const carrerasApi = {
    // Obtener todas las carreras
    getAll: async (): Promise<Carrera[]> => {
        const response = await apiClient.get<{ success: boolean; data: Carrera[] }>('/carreras');
        return response.success ? response.data : [];
    },

    // Obtener por ID
    getById: async (id: number): Promise<Carrera | null> => {
        const response = await apiClient.get<{ success: boolean; data: Carrera }>(`/carreras/${id}`);
        return response.success ? response.data : null;
    },

    // Obtener tipos de carrera
    getTipos: async (): Promise<any[]> => {
        const response = await apiClient.get<{ success: boolean; data: any[] }>('/tipos-carrera');
        return response.success ? response.data : [];
    },

    // Crear nueva carrera
    create: async (data: Carrera): Promise<Carrera | null> => {
        const response = await apiClient.post<{ success: boolean; data: Carrera }>('/carreras', data);
        return response.success ? response.data : null;
    },

    // Actualizar carrera
    update: async (id: number, data: Carrera): Promise<Carrera | null> => {
        const response = await apiClient.put<{ success: boolean; data: Carrera }>(`/carreras/${id}`, data);
        return response.success ? response.data : null;
    },

    // Eliminar carrera (soft delete)
    delete: async (id: number): Promise<boolean> => {
        const response = await apiClient.delete<{ success: boolean }>(`/carreras/${id}`);
        return response.success;
    },
};