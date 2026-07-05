import { apiClient } from '../client';
import type { Carrera, CrearCarreraInput, TipoTrabajo } from '../types';

export const carrerasApi = {
  getAll: async () => {
    const response = await apiClient.get('/carreras');
    return response.data || [];
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

        
    
    // ===== TIPOS DE CARRERA =====
    listarTiposCarrera: async () => {
        return await apiClient.get('/carreras/tipos-carrera');
    },
    crearTipoCarrera: async (data: { nombre: string; descripcion?: string }) => {
        return await apiClient.post('/carreras/tipos-carrera', data);
    },
    actualizarTipoCarrera: async (id: number, data: { nombre?: string; descripcion?: string }) => {
        return await apiClient.put(`/carreras/tipos-carrera/${id}`, data);
    },
    eliminarTipoCarrera: async (id: number) => {
        return await apiClient.delete(`/carreras/tipos-carrera/${id}`);
    },

    // ===== TIPOS DE TRABAJO =====
    listarTiposTrabajo: async () => {
        return await apiClient.get('/carreras/tipos-trabajo');
    },
    crearTipoTrabajo: async (data: { nombre: string }) => {
        return await apiClient.post('/carreras/tipos-trabajo', data);
    },
    actualizarTipoTrabajo: async (id: number, data: { nombre: string }) => {
        return await apiClient.put(`/carreras/tipos-trabajo/${id}`, data);
    },
    eliminarTipoTrabajo: async (id: number) => {
        return await apiClient.delete(`/carreras/tipos-trabajo/${id}`);
    },

    // ===== ASOCIACIONES =====
    listarAsociaciones: async () => {
        return await apiClient.get('/carreras/carrera-tipo-trabajo');
    },
    crearAsociacion: async (data: { id_tipo_carrera: number; id_tipo_trabajo: number }) => {
        return await apiClient.post('/carreras/carrera-tipo-trabajo', data);
    },
    eliminarAsociacion: async (id: number) => {
        return await apiClient.delete(`/carreras/carrera-tipo-trabajo/${id}`);
    },
    obtenerTiposTrabajoPorCarrera: async (id_tipo_carrera: number) => {
        return await apiClient.get(`/carreras/carrera-tipo-trabajo/carrera/${id_tipo_carrera}`);
    }

};