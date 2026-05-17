// services/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/env';

// Definir tipos para las respuestas
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    multiple?: boolean;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async getHeaders(): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        
        // Obtener token del AsyncStorage
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    // private async request<T>(
    //     endpoint: string,
    //     options: RequestInit = {}
    // ): Promise<T> {
    //     const url = `${this.baseUrl}${endpoint}`;
    //     const response = await fetch(url, {
    //         ...options,
    //         headers: {
    //             'Content-Type': 'application/json',
    //             ...options.headers,
    //         },
    //     });

    //     return response.json();
    // }
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = await this.getHeaders();
        
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        const data = await response.json();
        
        //  Si es 401 (no autorizado), limpiar sesión
        if (response.status === 401) {
            await AsyncStorage.removeItem('@user');
            await AsyncStorage.removeItem('@auth_token');
        }

        return data as T;
    }
    
    async get<T = any>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint);
    }

    async post<T = any>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T = any>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch<T = any>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    async upload<T = any>(endpoint: string, formData: FormData): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        return response.json();
    }

    async uploadPut<T = any>(endpoint: string, formData: FormData): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'PUT',
            body: formData,
        });
        return response.json();
    }
}

export const apiClient = new ApiClient(API_URL);