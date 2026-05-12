// services/api/endpoints/documentos.ts
import { apiClient } from '../client';
import type { Documento, CrearDocumentoInput, ListarDocumentosParams, PaginatedResponse } from '../types';

export const documentosApi = {
    // Obtener todos los documentos
    getAll: async (params: ListarDocumentosParams  = {}): Promise<PaginatedResponse<Documento>> => {
        const queryParams = new URLSearchParams();
        if (params.id_materia) queryParams.append('id_materia', params.id_materia.toString());
        if (params.buscar) queryParams.append('buscar', params.buscar);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        
        const url = `/documentos${queryParams.toString() ? `?${queryParams}` : ''}`;
        // const response = await apiClient.get<{ success: boolean; data: Documento }>(url);
         return await apiClient.get<PaginatedResponse<Documento>>(url);
    },

    // Obtener documento por ID
    getById: async (id: number): Promise<Documento | null> => {
        const response = await apiClient.get<{ success: boolean; data: Documento }>(`/documentos/${id}`);
        return response.success ? response.data : null;
    },

    // Crear documento
    create: async (formData: FormData): Promise<any> => {
        return await apiClient.upload('/documentos/save', formData);
    },

    // Actualizar documento
    update: async (id: number, formData: FormData): Promise<any> => {
        return await apiClient.uploadPut(`/documentos/update/${id}`, formData);
    },

    // Eliminar documento (soft delete)
    delete: async (id: number): Promise<boolean> => {
        const response = await apiClient.delete<{ success: boolean }>(`/documentos/delete/${id}`);
        return response.success;
    },
};