// services/api/endpoints/auth.ts
import { apiClient } from '../client';
import { LoginData, RegisterData } from '../types';

export const authApi = {
    login: async (data: LoginData) => {
        return await apiClient.post('/auth/login', data);
    },


    getMe: async () => {
        return await apiClient.get('/auth/me');
    },

    // Enviar código de verificación
    enviarCodigo: async (data: { email: string, nombre: string }) => {
        return await apiClient.post('/auth/send-code', data);
    },

    // Verificar código y crear usuario
    verificarYRegistrar: async (data: {
        email: string;
        codigo: string;
        password: string;
        nombre: string;
    }) => {
        return await apiClient.post('/auth/verify-and-register', data);
    },

    // Reenviar código
    reenviarCodigo: async (data: { email: string }) => {
        return await apiClient.post('/auth/resend-code', data);
    },

    enviarCodigoRecuperacion: async (data: { email: string }) => {
        return await apiClient.post('/auth/forgot-password', data);
    },

    verificarCodigoRecuperacion: async (data: { email: string; codigo: string }) => {
        return await apiClient.post('/auth/verify-reset-code', data);
    },

    cambiarContrasena: async (data: { email: string; codigo: string; nueva_contrasena: string }) => {
        return await apiClient.post('/auth/reset-password', data);
    },
};