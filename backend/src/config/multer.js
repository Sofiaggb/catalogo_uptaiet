// // src/config/multer.js
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Crear carpeta uploads si no existe
// const uploadDir = path.join(__dirname, '../../uploads/tesis');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configuración de almacenamiento
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         // Generar nombre único: timestamp-idoriginal.pdf
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const ext = path.extname(file.originalname);
//         cb(null, `tesis-${uniqueSuffix}${ext}`);
//     }
// });

// // Filtro para solo PDF
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') {
//         cb(null, true);
//     } else {
//         cb(new Error('Solo se permiten archivos PDF'), false);
//     }
// };

// // Configuración de multer
// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 10 * 1024 * 1024, // 10MB máximo
//     },
//     fileFilter: fileFilter
// });

// export default upload;


// src/config/multer.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tipos de recursos permitidos
export const TIPO_RECURSO = {
    TESIS: 'tesis',
    LIBRO: 'libros',
    DOCUMENTO: 'documentos',
    RECURSO: 'recursos'
};

// Configuración de carpetas por tipo
const carpetas = {
    [TIPO_RECURSO.TESIS]: path.join(__dirname, '../../uploads/tesis'),
    [TIPO_RECURSO.LIBRO]: path.join(__dirname, '../../uploads/libros'),
    [TIPO_RECURSO.DOCUMENTO]: path.join(__dirname, '../../uploads/documentos'),
    // [TIPO_RECURSO.RECURSO]: path.join(__dirname, '../../uploads/recursos')
};

// Crear todas las carpetas necesarias
Object.values(carpetas).forEach(carpeta => {
    if (!fs.existsSync(carpeta)) {
        fs.mkdirSync(carpeta, { recursive: true });
        console.log(`📁 Creada carpeta: ${carpeta}`);
    }
});

// Función para crear el storage dinámicamente según el tipo
const createStorage = (tipo) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const carpetaDestino = carpetas[tipo] || carpetas[TIPO_RECURSO.DOCUMENTO];
            cb(null, carpetaDestino);
        },
        filename: (req, file, cb) => {
            // Generar nombre único: tipo-timestamp-idoriginal
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            const nombreBase = path.basename(file.originalname, ext);
            const nombreLimpio = nombreBase.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
            cb(null, `${tipo}-${nombreLimpio}-${uniqueSuffix}${ext}`);
        }
    });
};

// Filtro común para tipos de archivo
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];
    
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo PDF, DOC, DOCX, JPG, PNG, GIF`), false);
    }
};

// Límites comunes
const limits = {
    fileSize: 20 * 1024 * 1024, // 20MB máximo
};

// Exportar middlewares específicos por tipo
const upload = {
    // Para tesis (solo PDF, 10MB)
    tesis: multer({
        storage: createStorage(TIPO_RECURSO.TESIS),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Solo se permiten archivos PDF'), false);
            }
        }
    }),

    // Para libros (PDF, 20MB)
    libros: multer({
        storage: createStorage(TIPO_RECURSO.LIBRO),
        limits: { fileSize: 20 * 1024 * 1024 },
        fileFilter
    }),

    // Para documentos (varios formatos, 15MB)
    documentos: multer({
        storage: createStorage(TIPO_RECURSO.DOCUMENTO),
        limits: { fileSize: 15 * 1024 * 1024 },
        fileFilter
    }),

    // Para recursos generales (varios formatos, 10MB)
    // recursos: multer({
    //     storage: createStorage(TIPO_RECURSO.RECURSO),
    //     limits: { fileSize: 10 * 1024 * 1024 },
    //     fileFilter
    // })
};

// Función auxiliar para obtener la URL pública de un archivo
export const getFileUrl = (tipo, filename) => {
    if (!filename) return null;
    return `/uploads/${tipo}/${filename}`;
};

// Función auxiliar para eliminar un archivo
export const deleteFile = (filePath) => {
    if (!filePath) return false;
    
    const fullPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(` Archivo eliminado: ${fullPath}`);
        return true;
    }
    return false;
};

export default upload;