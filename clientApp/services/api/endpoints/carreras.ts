// services/api/endpoints/carreras.ts
import { apiClient } from '../client';
import type { Carrera, CrearCarreraInput, TipoTrabajo } from '../types';

export const carrerasApi = {
    // Obtener todas las carreras
    getAll: async (): Promise<Carrera[]> => {
        const response = await apiClient.get<{ success: boolean; data: Carrera[] }>('/carreras');
        return response.success ? response.data : [];
    },

    // Obtener por ID
    getById: async (id: number): Promise<Carrera | null> => {
        const response = await apiClient.get<{ success: boolean; data: Carrera }>(`/carreras/byId/${id}`);
        return response.success ? response.data : null;
    },

    // Obtener tipos de carrera
    getTipos: async (): Promise<any[]> => {
        const response = await apiClient.get<{ success: boolean; data: any[] }>('/carreras/tipos');
        return response.success ? response.data : [];
    },
    
    // Obtener tipos de trabajo por ID de carrera
    getTiposTrabajoByCarrera: async (idCarrera: number): Promise<TipoTrabajo[] | any[]> => {
            const response = await apiClient.get<{ success: boolean; data: TipoTrabajo[] }>(
                `/carreras/${idCarrera}/tipos-trabajo`
            );
            return response.success ? response.data : [];       
    },
   
    // Crear nueva carrera
    create: async (data: CrearCarreraInput): Promise<any> => {
        return await apiClient.post<{ success: boolean; data: Carrera }>('/carreras/save', data);
    },

    // Actualizar carrera
    update: async (id: number, data: CrearCarreraInput): Promise<any> => {
        return await apiClient.put<{ success: boolean; data: Carrera }>(`/carreras/upload/${id}`, data);
    },

    // Eliminar carrera (soft delete)
    delete: async (id: number): Promise<boolean> => {
        const response = await apiClient.delete<{ success: boolean }>(`/carreras/${id}`);
        return response.success; 
    },
};