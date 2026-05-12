
export interface TipoCarrera {
    id_tipo_carrera: number;
    nombre: string;
    descripcion?: string;
}

export interface TipoTrabajo {
    id_tipo_trabajo: number;
    nombre: string;
}

export interface Carrera {
    id_carrera: number;  
    nombre: string;
    descripcion?: string;
    id_tipo_carrera?: number;
    tipo_carrera?: string; 
    id_tipo_trabajo?: number;   
    tipo_trabajo?: string; 
}

// Para creación/edición
export interface CrearCarreraInput {
    id_carrera?: number | null;  
    nombre: string;
    descripcion?: string;
    id_tipo_carrera?: number | null;
    id_tipo_trabajo?: number | null;  
}


export interface Estudiante {
    id_estudiante?: number;
    nombre_completo: string;
    cedula: string;
    email: string;
    esExistente: boolean;
}

export interface Jurado {
    id_jurado?: number;
    nombre_completo: string;
    cedula: string;
    titulo_profesional: string;
    esExistente: boolean;
}

export interface Evaluacion {
    id_evaluacion?: number;
    nota: string;
    fecha_evaluacion: string;
    comentarios: string;
    jurado: Jurado;
}

export interface Tesis {
    id_tesis: number;
    titulo: string;
    resumen?: string;
    resumen_corto?: string;
    anio_elaboracion?: number;
    fecha_creacion: string;
    url_documento?: string;
    id_carrera: number;
    nombre_carrera?: string;
    id_estado?: number;
    nombre_estado?: string;
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
    anio_elaboracion: number;
    url_documento: string | null;
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

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        pages: number;
    };
}

// materias
export interface Materia {
    id_materia: number;
    nombre: string;
}

export interface CrearMateriaInput {
    nombre: string;
}

export interface ListarMateriasParams {
    id_carrera?: number;
    semestre?: number;
    buscar?: string;
    limit?: number;
    page?: number;
}

//  documento 
export interface Documento {
    id_documento: number;
    titulo: string;
    autor?: string;
    url_recurso?: string;
    descripcion?: string;
    id_materia: number;
    materia?: string; 
    fecha_creacion?: string;
}

export interface CrearDocumentoInput {
    titulo: string;
    autor?: string;
    url_recurso?: string;
    descripcion?: string;
    id_materia: number;
}

export interface ListarDocumentosParams {
    id_materia?: number;
    buscar?: string;
    limit?: number;
    page?: number;
}