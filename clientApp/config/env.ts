// config/env.ts
import { Platform } from 'react-native';

// ============================================
// CONFIGURACIÓN GLOBAL DE API
// ============================================

// Función para obtener la URL base según el entorno
const getApiUrl = (): string => {
    // Modo desarrollo
    if (__DEV__) {
        // Android Emulator
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:3000/api';

        }
        // iOS Emulator
        if (Platform.OS === 'ios') {
            // return 'http://192.168.0.106:3000/api';

            return 'http://10.8.1.7:3000/api';
        }
        // Web
        return 'http://localhost:3000/api';
    }
    
    // Modo producción - cambiar por tu URL real
    return 'https://tu-api-produccion.com/api';
};

// URL base de la API
export const API_URL = getApiUrl();

// URL para archivos estáticos (documentos PDF)
export const STATIC_URL = API_URL.replace('/api', '');

// Versión de la API
export const API_VERSION = 'v1';

// Timeout por defecto (milisegundos)
export const DEFAULT_TIMEOUT = 30000;

// Headers por defecto
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

// Función para obtener headers con token
export const getAuthHeaders = (token?: string) => ({
    ...DEFAULT_HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` })
});

console.log('API_URL:', API_URL);
console.log('Platform:', Platform.OS);
console.log('Modo:', __DEV__ ? 'Desarrollo' : 'Producción');