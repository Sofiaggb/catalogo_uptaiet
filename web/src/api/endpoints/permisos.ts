import { apiClient } from "../client";

export const permisosService = {
    // Obtener todos los usuarios (excepto invitados)
    obtenerUsuarios: async (params?: {  page?: number ; search?: string}) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);      
        if (params?.page) queryParams.append('page', params.page.toString());


        return await apiClient.get(`/admin/usuarios${queryParams.toString() ? `?${queryParams}` : ''}`);
    },

    // Obtener la matriz de permisos de un usuario específico
    obtenerPermisosUsuario: async (id: number) => {
        return await apiClient.get(`/admin/permisos/byId/${id}`);
    },

    // Dar un permiso EXTRA a un usuario
    asignarPermiso: async (id_usuario: number, id_permiso: number) => {
        return await apiClient.post(`/admin/permisos/asignar`, { id_usuario, id_permiso });
    },

    // Bloquear un permiso (quitarlo aunque sea del rol)
    bloquearPermiso: async (id_usuario: number, id_permiso: number) => {
        return await apiClient.post(`/admin/permisos/bloquear`, { id_usuario, id_permiso });
    },

    // Limpiar permisos (restablecer al rol base)
    limpiarPermisos: async (id_usuario: number) => {
        return await apiClient.post(`/admin/permisos/limpiar`, { id_usuario });
    },
};