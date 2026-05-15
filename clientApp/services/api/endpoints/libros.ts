// services/api/endpoints/documentos.ts
import { apiClient } from '../client';
import type { Libros, CrearDocumentoInput, ListarDocumentosParams, PaginatedResponse } from '../types';

export const librosApi = {
    // Obtener todos los documentos
    getAll: async (params: ListarDocumentosParams  = {}): Promise<PaginatedResponse<Libros>> => {
        const queryParams = new URLSearchParams();
        if (params.id_materia) queryParams.append('id_materia', params.id_materia.toString());
        if (params.buscar) queryParams.append('buscar', params.buscar);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        
        const url = `/libros${queryParams.toString() ? `?${queryParams}` : ''}`;
        // const response = await apiClient.get<{ success: boolean; data: Documento }>(url);
         return await apiClient.get<PaginatedResponse<Libros>>(url);
    },

    // Obtener documento por ID
    getById: async (id: number): Promise<Libros | null> => {
        const response = await apiClient.get<{ success: boolean; data: Libros }>
        (`/libros/${id}`);
        return response.success ? response.data : null;
    },

    // Crear documento
    create: async (formData: FormData): Promise<any> => {
        return await apiClient.upload('/libros/save', formData);
    },

    // Actualizar documento
    update: async (id: number, formData: FormData): Promise<any> => {
        return await apiClient.uploadPut(`/libros/update/${id}`, formData);
    },

    // Eliminar documento (soft delete)
    delete: async (id: number): Promise<boolean> => {
        const response = await apiClient.delete<{ success: boolean }>(`/libross/delete/${id}`);
        return response.success;
    },
};