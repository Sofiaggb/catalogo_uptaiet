// app/helpers/validations.ts

// Validación para texto requerido
export const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value || !value.trim()) {
        return `${fieldName} es obligatorio`;
    }
    return null;
};

//  validacion de yeAR
export const validateYear = (year: string): string | null => {
    if (!year || !year.trim()) {
        return 'El año es obligatorio ';
    }

    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();

    if (isNaN(yearNum)) {
        return 'El año debe ser un número válido';
    }

    if (yearNum < 1600 || yearNum > currentYear + 1) {
        return `El año debe estar entre 1600 y ${currentYear + 1}`;
    }

    return null;
};


// Validación para email
export const validateEmail = (email: string): string | null => {
    if (!email || !email.trim()) {
        return null; // Email opcional, no hay error si está vacío
    }

    // Formato de email válido
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        return 'El email no es válido. Ejemplo: nombre@dominio.com';
    }

    return null;
};

// Validación para cédula (básica)
export const validateCedula = (cedula: string): string | null => {
    if (!cedula || !cedula.trim()) {
        return 'La cédula es obligatoria';
    }

    // Formato: letra (V/E/J/P/G) + números (6-8 dígitos)
    // Ejemplos: V31566778, E12345678, J1234567
    const regex = /^[VEJPG]\d{6,8}$/i;

    if (!regex.test(cedula.trim())) {
        return 'Formato de cédula inválido. Debe ser: V12345678, E12345678, J12345678';
    }

    return null;
};

// Validación para nota (0-20)
export const validateNota = (nota: string): string | null => {
    if (!nota || !nota.trim()) {
        return 'La nota es obligatoria';
    }
    const num = parseFloat(nota);
    if (isNaN(num)) {
        return 'Debe ser un número';
    }
    if (num < 0 || num > 20) {
        return 'La nota debe estar entre 0 y 20';
    }
    return null;
};

// Validación para fecha
export const validateFecha = (fecha: string): string | null => {
    if (!fecha || !fecha.trim()) {
        return 'La fecha es obligatoria';
    }
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) {
        return 'Formato de fecha inválido (YYYY-MM-DD)';
    }
    return null;
};

// Validación para título profesional 
export const validateTituloProfesional = (titulo: string): string | null => {
    if (!titulo || !titulo.trim()) {
        return 'El título profesional del jurado es obligatorio';
    }
    if (titulo.trim().length < 3) {
        return 'El título profesional debe tener al menos 3 caracteres';
    }
    return null;
};

// Validar todo el formulario de tesis
export const validateTesisForm = (form: {
    titulo: string;
    id_carrera: string;
    id_year: string;
    tieneDocumento: boolean;  
}): {
    isValid: boolean; errors: {
        titulo?: string; id_carrera?: string; id_year?: string;
        documento?: string
    }
} => {
    const errors: any = {};

    const tituloError = validateRequired(form.titulo, 'El título');
    if (tituloError) errors.titulo = tituloError;

    const carreraError = validateRequired(form.id_carrera, 'La carrera');
    if (carreraError) errors.id_carrera = carreraError;

    const yearError = validateYear(form.id_year);
    if (yearError) errors.id_year = yearError;

      if (!form.tieneDocumento) {
        errors.documento = 'Debes tener un archivo PDF de la tesis';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Validar un estudiante
export const validateEstudiante = (estudiante: {
    nombre_completo: string;
    cedula: string;
    email?: string;
}, index: number): { isValid: boolean; errors: { nombre?: string; cedula?: string; email?: string } } => {
    const errors: { nombre?: string; cedula?: string; email?: string } = {};

    // Nombre completo (requerido)
    const nombreError = validateRequired(estudiante.nombre_completo, `El nombre del estudiante ${index + 1}`);
    if (nombreError) errors.nombre = nombreError;

    // Cédula (requerida con formato Venezuela)
    const cedulaError = validateCedula(estudiante.cedula);
    if (cedulaError) errors.cedula = cedulaError;

    // Email (opcional pero válido si se ingresa)
    if (estudiante.email && estudiante.email.trim()) {
        const emailError = validateEmail(estudiante.email);
        if (emailError) errors.email = emailError;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Validar una evaluación 
export const validateEvaluacion = (evaluacion: {
    nota: string;
    fecha_evaluacion: string;
    comentarios?: string;
    jurado: {
        nombre_completo: string;
        cedula: string;
        titulo_profesional?: string;
    };
}, index: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Nota
    const notaError = validateNota(evaluacion.nota);
    if (notaError) errors.push(`Evaluación ${index + 1}: ${notaError}`);

    // Fecha
    const fechaError = validateFecha(evaluacion.fecha_evaluacion);
    if (fechaError) errors.push(`Evaluación ${index + 1}: ${fechaError}`);

    // Nombre del jurado (requerido)
    const nombreJuradoError = validateRequired(evaluacion.jurado.nombre_completo, `El nombre del jurado ${index + 1}`);
    if (nombreJuradoError) errors.push(`Evaluación ${index + 1}: ${nombreJuradoError}`);

    // Cédula del jurado (formato Venezuela)
    const cedulaJuradoError = validateCedula(evaluacion.jurado.cedula);
    if (cedulaJuradoError) errors.push(`Evaluación ${index + 1}: ${cedulaJuradoError}`);

    // Título profesional del jurado (REQUERIDO - nuevo)
    const tituloError = validateTituloProfesional(evaluacion.jurado.titulo_profesional || '');
    if (tituloError) errors.push(`Evaluación ${index + 1}: ${tituloError}`);

    return {
        isValid: errors.length === 0,
        errors
    };
};


// Validar todo el formulario de tesis
export const validateLibroForm = (form: {
    titulo: string;
    autor: string;
    editorial: string;
    id_materia: string;
    id_year: string;
    tieneDocumento: boolean;  
}): {
    isValid: boolean; errors: {
        titulo?: string; id_materia?: string; autor?: string;editorial?: string; id_year?: string;
        documento?: string
    }
} => {
    const errors: any = {};

    const tituloError = validateRequired(form.titulo, 'El título');
    if (tituloError) errors.titulo = tituloError;

    const autorError = validateRequired(form.autor, 'El autor');
    if (autorError) errors.autor = autorError;

    const editorialError = validateRequired(form.editorial, 'La editorial');
    if (editorialError) errors.editorial = editorialError;

    const id_materiaError = validateRequired(form.id_materia, 'La materia');
    if (id_materiaError) errors.id_materia = id_materiaError;

    const yearError = validateYear(form.id_year);
    if (yearError) errors.id_year = yearError;

    if (!form.tieneDocumento) {
        errors.documento = 'Debes tener un archivo PDF de la tesis';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};