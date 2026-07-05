import { apiClient } from "../client";

export const headerService = {
    // Obtener encabezado (público)
    obtenerEncabezado: async () => {
        return await apiClient.get('/encabezado');
    },
    
    // Actualizar imagen del encabezado (admin)
    actualizarImagenEncabezado: async (formData: FormData)  : Promise<any>=>  {
        return await apiClient.upload('/admin/encabezado', formData);
    },
    
    // Eliminar encabezado (admin)
    eliminarEncabezado: async () => {
        return await apiClient.delete('/admin/encabezado');
    }
};