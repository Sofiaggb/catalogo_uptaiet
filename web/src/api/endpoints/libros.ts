// api/endpoints/documentos.ts
import { apiClient } from '../client';
import type { Libros, PaginatedResponse } from '../types';

export const librosApi = {
    // Obtener todos los documentos
    getAll: async (params: any = {}): Promise<PaginatedResponse<Libros>> => {
        const queryParams = new URLSearchParams();
        if (params.id_materia) {
            const v = Array.isArray(params.id_materia) ? params.id_materia.join(',') : params.id_materia;
            queryParams.append('id_materia', v);
        }
        if (params.id_tipo_recurso) {
            const v = Array.isArray(params.id_tipo_recurso) ? params.id_tipo_recurso.join(',') : params.id_tipo_recurso;
            queryParams.append('id_tipo_recurso', v);
        }
        if (params.anio) {
            const v = Array.isArray(params.anio) ? params.anio.join(',') : params.anio;
            queryParams.append('anio', v);
        }

        if (params.buscar) queryParams.append('buscar', params.buscar);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.page) queryParams.append('page', params.page.toString());

        const url = `/libros${queryParams.toString() ? `?${queryParams}` : ''}`;
        // const response = await apiClient.get<{ success: boolean; data: Documento }>(url);
        return await apiClient.get<PaginatedResponse<Libros>>(url);
    },

    // Obtener documento por ID
    getById: async (id: number): Promise<Libros | any> => {
        return await apiClient.get(`/libros/byId/${id}`);
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

    getTiposRecursos: async () => {
        return await apiClient.get('/libros/tipos-recursos');
    },


    //  Listar para gestión
    listarGestion: async (params: any = {}) => {
        const queryParams = new URLSearchParams();
        if (params.buscar) queryParams.append('buscar', params.buscar);
        if (params.id_materia) {
            const v = Array.isArray(params.id_materia) ? params.id_materia.join(',') : params.id_materia;
            queryParams.append('id_materia', v);
        }
        if (params.id_tipo_recurso) {
            const v = Array.isArray(params.id_tipo_recurso) ? params.id_tipo_recurso.join(',') : params.id_tipo_recurso;
            queryParams.append('id_tipo_recurso', v);
        }
        if (params.anio) {
            const v = Array.isArray(params.anio) ? params.anio.join(',') : params.anio;
            queryParams.append('anio', v);
        }
        if (params.estado) queryParams.append('estado', params.estado.toString());
        if (params.orden) queryParams.append('orden', params.orden);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        return await apiClient.get(`/libros/gestion?${queryParams}`);
    },

    //  Aprobar/Rechazar
    revisar: async (id, aprobar, comentario = null) => {
        return await apiClient.put(`/libros/revisar/${id}`, { aprobar, comentario });
    },

    // Contar pendientes
    contarPendientes: async () => {
        return await apiClient.get('/libros/pendientes/count');
    },

    // Años disponibles
    getAnios: async () => {
        return await apiClient.get('/libros/gestion/anios');
    },

};