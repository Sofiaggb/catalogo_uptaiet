// web/src/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const STATIC_URL = API_URL.replace('/api', '');
console.log('API URL:', API_URL);
console.log('App Name:', import.meta.env.VITE_APP_NAME);
console.log('Mode:', import.meta.env.MODE); // 'development' o 'production'

// Definir el tipo de respuesta estándar de tu API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('@auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (response.status === 401) {
      localStorage.removeItem('@user');
      localStorage.removeItem('@auth_token');
      window.location.href = '/login';
    }

    return data as T;
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T = ApiResponse>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = ApiResponse>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = ApiResponse>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });
    
    const data = await response.json();
    return data as T;
  }

  async uploadPut<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      body: formData,
      headers,
    });
    
    const data = await response.json();
    return data as T;
  }

}

export const apiClient = new ApiClient(API_URL);
export type { ApiResponse };