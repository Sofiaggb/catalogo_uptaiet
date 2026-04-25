// const API_URL = 'http://192.168.0.106:3000/api';

// // ============================================
// // TIPOS DE DATOS
// // ============================================

// // Tipo para estudiante (puede ser existente o nuevo)
// export type EstudianteInput = 
//     | { id_estudiante: number }  // Existente
//     | { nombre_completo: string; cedula: string; email?: string };  // Nuevo

// // Tipo para jurado (puede ser existente o nuevo)
// export type JuradoInput = 
//     | { id_jurado: number }  // Existente
//     | { nombre_completo: string; cedula: string; titulo_profesional?: string };  // Nuevo

// // Tipo para evaluación
// export type EvaluacionInput = {
//     nota: number;
//     fecha_evaluacion: string;
//     comentarios?: string;
//     jurado: JuradoInput;
// };

// // Tipo para crear tesis
// export type CrearTesisInput = {
//     titulo: string;
//     resumen?: string;
//     id_carrera: number;
//     url_documento?: string | null;
//     estudiantes: EstudianteInput[];
//     evaluaciones: EvaluacionInput[];
// };


// // FUNCIÓN PARA CREAR TESIS 

// export const crearTesis = async (datosTesis: CrearTesisInput) => {
//     try {
//         console.log('Enviando datos:', JSON.stringify(datosTesis, null, 2));
        
//         const response = await fetch(`${API_URL}/tesis`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(datosTesis),
//         });
        
//         const resultado = await response.json();
//         console.log('Respuesta del servidor:', resultado);
//         return resultado;
//     } catch (error) {
//         console.error('Error al crear tesis:', error);
//         return {
//             success: false,
//             error: 'Error de conexión con el servidor',
//         };
//     }
// };



// // BUSCAR POR CÉDULA

// export const buscarPorCedula = async (tipo: 'estudiante' | 'jurado', cedula: string) => {
//     try {
//         const response = await fetch(`${API_URL}/tesis/${tipo}s/cedula/${cedula}`);
        
//         if (response.status === 404) {
//             return { success: false, data: null, error: 'No encontrado' };
//         }
        
//         const data = await response.json();
//         return { success: true, data };
//     } catch (error) {
//         console.error(`Error buscando ${tipo}:`, error);
//         return { success: false, error: 'Error de conexión', data: null };
//     }
// };



// // FUNCIONES AUXILIARES PARA OBTENER LISTAS

// // Obtener lista de carreras (para el selector)
// export const getCarreras = async () => {
//     try {
//         const response = await fetch(`${API_URL}/carreras`);
//         const data = await response.json();
//         return data.success ? data.data : [];
//     } catch (error) {
//         console.error('Error obteniendo carreras:', error);
//         return [];
//     }
// };

// // Obtener lista de tipos de carrera
// export const getTiposCarrera = async () => {
//     try {
//         const response = await fetch(`${API_URL}/tipos-carrera`);
//         const data = await response.json();
//         return data.success ? data.data : [];
//     } catch (error) {
//         console.error('Error obteniendo tipos de carrera:', error);
//         return [];
//     }
// };



// services/api.ts
import { Platform } from 'react-native';

// ============================================
// CONFIGURACIÓN
// ============================================

// Configuración de entorno
const getApiUrl = () => {
    // Desarrollo
    if (__DEV__) {
        // Android emulator
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:3000/api';
        }
        // iOS emulator o web
        return 'http://192.168.0.106:3000/api';
    }
    // Producción - cambiar por tu URL real
    return 'https://tu-api-produccion.com/api';
};

const API_URL = getApiUrl();

console.log('API URL:', API_URL);

// ============================================
// TIPOS DE DATOS COMPLETOS
// ============================================

export interface Carrera {
    id_carrera: number;
    nombre: string;
    descripcion?: string;
    id_tipo_carrera?: number;
}

export interface Estado {
    id_estado: number;
    nombre_estado: string;
    descripcion?: string;
    color_hex?: string;
}

export interface Estudiante {
    id_estudiante: number;
    nombre_completo: string;
    cedula: string;
    email?: string;
}

export interface Jurado {
    id_jurado: number;
    nombre_completo: string;
    cedula: string;
    titulo_profesional?: string;
}

export interface Evaluacion {
    id_evaluacion: number;
    nota: number;
    fecha_evaluacion: string;
    comentarios?: string;
    jurado: Jurado;
}

export interface Tesis {
    id_tesis: number;
    titulo: string;
    resumen?: string;
    resumen_corto?: string;
    fecha_publicacion?: string;
    fecha_creacion: string;
    url_documento?: string;
    id_carrera: number;
    nombre_carrera?: string;
    carrera?: Carrera;
    id_estado?: number;
    nombre_estado?: string;
    estado?: Estado;
    total_estudiantes?: number;
    promedio_nota?: number;
    estudiantes?: Estudiante[];
    evaluaciones?: Evaluacion[];
}

// Tipos para inputs
export type EstudianteInput = 
    | { id_estudiante: number }
    | { nombre_completo: string; cedula: string; email?: string };

export type JuradoInput = 
    | { id_jurado: number }
    | { nombre_completo: string; cedula: string; titulo_profesional?: string };

export type EvaluacionInput = {
    nota: number;
    fecha_evaluacion: string;
    comentarios?: string;
    jurado: JuradoInput;
};

export type CrearTesisInput = {
    titulo: string;
    resumen?: string;
    id_carrera: number;
    url_documento?: string | null;
    estudiantes: EstudianteInput[];
    evaluaciones: EvaluacionInput[];
};

export type ListarTesisParams = {
    id_carrera?: number;
    id_estado?: number;
    anio?: number;
    buscar?: string;
    limit?: number;
    page?: number;
};

export type PaginatedResponse<T> = {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        pages: number;
    };
};

// ============================================
// FUNCIONES DE TESIS
// ============================================

/**
 * Listar tesis con filtros y paginación
 */
export const listarTesis = async (params: ListarTesisParams = {}): Promise<PaginatedResponse<Tesis>> => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.id_carrera) queryParams.append('id_carrera', params.id_carrera.toString());
        if (params.id_estado) queryParams.append('id_estado', params.id_estado.toString());
        if (params.anio) queryParams.append('anio', params.anio.toString());
        if (params.buscar) queryParams.append('buscar', params.buscar);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        
        const url = `${API_URL}/tesis${queryParams.toString() ? `?${queryParams}` : ''}`;
        console.log('Fetching tesis:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error listando tesis:', error);
        return {
            success: false,
            data: [],
            pagination: { total: 0, limit: 50, offset: 0, pages: 0 }
        };
    }
};

/**
 * Obtener tesis por ID (completa)
 */
export const obtenerTesisPorId = async (id: number): Promise<Tesis | null> => {
    try {
        const response = await fetch(`${API_URL}/tesis/${id}`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Error obteniendo tesis:', error);
        return null;
    }
};

/**
 * Crear nueva tesis
 */
export const crearTesis = async (formData: FormData) => {
    try {
        const response = await fetch(`${API_URL}/tesis/save`, {
            method: 'POST',
            body: formData,
        });
        
        const resultado = await response.json();
        console.log('Respuesta:', resultado);
        return resultado;
    } catch (error) {
        console.error('Error al crear tesis:', error);
        return {
            success: false,
            error: 'Error de conexión con el servidor',
        };
    }
};

/**
 * Eliminar tesis (soft delete)
 */
export const eliminarTesis = async (id: number, forzarFisico: boolean = false) => {
    try {
        const url = `${API_URL}/tesis/${id}${forzarFisico ? '?forzar_fisico=true' : ''}`;
        const response = await fetch(url, { method: 'DELETE' });
        const resultado = await response.json();
        return resultado;
    } catch (error) {
        console.error('Error eliminando tesis:', error);
        return { success: false, error: 'Error de conexión' };
    }
};

/**
 * Restaurar tesis
 */
export const restaurarTesis = async (id: number) => {
    try {
        const response = await fetch(`${API_URL}/tesis/${id}/restaurar`, { method: 'PATCH' });
        const resultado = await response.json();
        return resultado;
    } catch (error) {
        console.error('Error restaurando tesis:', error);
        return { success: false, error: 'Error de conexión' };
    }
};

// ============================================
// BUSCADORES
// ============================================

/**
 * Buscar por cédula (estudiante o jurado)
 */
export const buscarPorCedula = async (tipo: 'estudiante' | 'jurado', cedula: string) => {
    try {
        const response = await fetch(`${API_URL}/${tipo}s/cedula/${cedula}`);
        
        if (response.status === 404) {
            return { success: false, data: null, error: 'No encontrado' };
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error(`Error buscando ${tipo}:`, error);
        return { success: false, error: 'Error de conexión', data: null };
    }
};

// ============================================
// CATÁLOGO
// ============================================

/**
 * Obtener lista de carreras
 */
export const getCarreras = async (): Promise<Carrera[]> => {
    try {
        const response = await fetch(`${API_URL}/carreras`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error obteniendo carreras:', error);
        return [];
    }
};

/**
 * Obtener carrera por ID
 */
export const getCarreraPorId = async (id: number): Promise<Carrera | null> => {
    try {
        const response = await fetch(`${API_URL}/carreras/${id}`);
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error obteniendo carrera:', error);
        return null;
    }
};

/**
 * Obtener lista de tipos de carrera
 */
export const getTiposCarrera = async () => {
    try {
        const response = await fetch(`${API_URL}/tipos-carrera`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error obteniendo tipos de carrera:', error);
        return [];
    }
};

/**
 * Obtener lista de estados
 */
export const getEstados = async (entidad?: string): Promise<Estado[]> => {
    try {
        const url = entidad ? `${API_URL}/estados?entidad=${entidad}` : `${API_URL}/estados`;
        const response = await fetch(url);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error obteniendo estados:', error);
        return [];
    }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtener años disponibles para filtros
 */
export const getAniosDisponibles = async (): Promise<number[]> => {
    try {
        const response = await fetch(`${API_URL}/tesis/anios`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error obteniendo años:', error);
        return [];
    }
};

/**
 * Upload de archivo PDF
 */
export const uploadPDF = async (archivo: File | Blob, tesisId?: number): Promise<{ url: string } | null> => {
    try {
        const formData = new FormData();
        formData.append('archivo_pdf', archivo);
        if (tesisId) formData.append('tesis_id', tesisId.toString());
        
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
        });
        
        const data = await response.json();
        return data.success ? { url: data.url } : null;
    } catch (error) {
        console.error('Error subiendo archivo:', error);
        return null;
    }
};