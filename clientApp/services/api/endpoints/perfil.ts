import { apiClient } from '../client';

export const perfilApi = {
    getMe: async () => {
        return await apiClient.get('/perfil/me');
    },

    // Subir foto de perfil
    subirFotoPerfil: async (formData: FormData) => {
        return apiClient.upload('/perfil/foto', formData);
    },
    
    // Obtener foto de perfil
    obtenerFotoPerfil: async () => {
        return await apiClient.get('/perfil/foto');
    },
    
    // Eliminar foto de perfil
    eliminarFotoPerfil: async () => {
        return await apiClient.delete('/perfil/foto');
    },
};