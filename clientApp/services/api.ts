const API_URL = 'http://192.168.0.106:3000/api';

// ============================================
// TIPOS DE DATOS
// ============================================

// Tipo para estudiante (puede ser existente o nuevo)
export type EstudianteInput = 
    | { id_estudiante: number }  // Existente
    | { nombre_completo: string; cedula: string; email?: string };  // Nuevo

// Tipo para jurado (puede ser existente o nuevo)
export type JuradoInput = 
    | { id_jurado: number }  // Existente
    | { nombre_completo: string; cedula: string; titulo_profesional?: string };  // Nuevo

// Tipo para evaluación
export type EvaluacionInput = {
    nota: number;
    fecha_evaluacion: string;
    comentarios?: string;
    jurado: JuradoInput;
};

// Tipo para crear tesis
export type CrearTesisInput = {
    titulo: string;
    resumen?: string;
    id_carrera: number;
    url_documento?: string | null;
    estudiantes: EstudianteInput[];
    evaluaciones: EvaluacionInput[];
};

// ============================================
// FUNCIÓN PARA CREAR TESIS (CORREGIDA)
// ============================================

export const crearTesis = async (datosTesis: CrearTesisInput) => {
    try {
        console.log('Enviando datos:', JSON.stringify(datosTesis, null, 2));
        
        const response = await fetch(`${API_URL}/tesis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosTesis),
        });
        
        const resultado = await response.json();
        console.log('Respuesta del servidor:', resultado);
        return resultado;
    } catch (error) {
        console.error('Error al crear tesis:', error);
        return {
            success: false,
            error: 'Error de conexión con el servidor',
        };
    }
};

// ============================================
// BUSCAR POR CÉDULA
// ============================================

export const buscarPorCedula = async (tipo: 'estudiante' | 'jurado', cedula: string) => {
    try {
        const response = await fetch(`${API_URL}/tesis/${tipo}s/cedula/${cedula}`);
        
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
// FUNCIONES AUXILIARES PARA OBTENER LISTAS
// ============================================

// Obtener lista de carreras (para el selector)
export const getCarreras = async () => {
    try {
        const response = await fetch(`${API_URL}/carreras`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error obteniendo carreras:', error);
        return [];
    }
};

// Obtener lista de tipos de carrera
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