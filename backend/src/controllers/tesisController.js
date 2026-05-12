// src/controllers/tesisController.js
import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';

export const tesisController = {
  createTesis: async (req, res) => {
    const { titulo, resumen, id_carrera,anio_elaboracion, estudiantes, evaluaciones } = req.body;
    console.log('anio_elaboracion',anio_elaboracion)
    // Obtener la ruta del archivo subido (si existe)
    let url_documento = null;
    console.log('req.file',req.file)
     if (req.file) {
        url_documento = `/uploads/tesis/${req.file.filename}`;
        console.log('Archivo recibido:', req.file.filename);
    } else {
        console.log('No se recibió ningún archivo');
    }

    try {
      const result = await pool.query(
        `SELECT tesis.crear_tesis($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8) AS resultado`,
        [
          titulo,
          resumen || null,
          id_carrera,
          anio_elaboracion,
          url_documento || null,
          JSON.stringify(JSON.parse(estudiantes) || []),
          JSON.stringify(JSON.parse(evaluaciones) || []),
          req.usuario?.id_usuario || null
        ]
      );

      const resultado = result.rows[0].resultado;
      if (!resultado.success) {
        // Si falló la BD, eliminar el archivo subido
        if (req.file) {
          const fs = await import('fs');
          fs.unlinkSync(req.file.path);
        }
        return res.status(resultado.status || 400).json(resultado);
      }

      // Usar el status que viene de la función
      res.status(resultado.status || (resultado.success ? 201 : 400)).json(resultado);

    } catch (error) {
      console.error('Error en createTesis:', error);
        // Limpiar archivo si hay error
        if (req.file) {
            const fs = await import('fs');
            fs.unlinkSync(req.file.path);
        }
        
      res.status(500).json({
        success: false,
        status: 500,
        error: 'Error interno del servidor',
        detalle: error.message
      });
    }
  },


  getTesisById: async (req, res) => {
    const { id } = req.params;

    try {
      // Llamar a la función PostgreSQL (SOLO UNA CONSULTA)
      const result = await pool.query(
        'SELECT tesis.obtener_tesis_completa($1) AS resultado',
        [id]
      );

      // La función devuelve JSONB, PostgreSQL lo parsea automáticamente
      const tesisCompleta = result.rows[0].resultado;

      res.json(tesisCompleta);

    } catch (error) {
      console.error('Error en getTesisCompleta:', error);

      // Manejar error específico de "tesis no encontrada"
      if (error.message.includes('Tesis no encontrada')) {
        return res.status(404).json({
          error: 'Tesis no encontrada',
          message: error.message
        });
      }

      res.status(500).json({
        error: 'Error al obtener la tesis',
        detalle: error.message
      });
    }
  },

  getTesis: async (req, res) => {
    const {
      id_carrera,
      id_estado,
      anio,
      buscar,
      limit = 50,
      page = 1
    } = req.query;

    const offset = (page - 1) * limit;

    try {
      const result = await pool.query(
        `SELECT tesis.listar_tesis($1, $2, $3, $4, $5, $6) AS resultado`,
        [id_carrera || null, id_estado || null, anio || null, buscar || null, limit, offset]
      );

      const resultado = result.rows[0].resultado;
      res.json(resultado);

    } catch (error) {
      console.error('Error en listarTesis:', error);
      res.status(500).json({
        success: false,
        error: 'Error al listar las tesis'
      });
    }
  },
  
  // Editar tesis existente
  updateTesis: async (req, res) => {
    const { id } = req.params;
    const { titulo, resumen, id_carrera, anio_elaboracion,estudiantes,evaluaciones} = req.body;
    let url_documento = null;
    let oldFilePath = null;
    // console.log(titulo, resumen, id_carrera, anio_elaboracion,estudiantes,evaluaciones)
    
    // Procesar nuevo archivo si existe
    if (req.file) {
      url_documento = `/uploads/tesis/${req.file.filename}`;
      console.log('Nuevo archivo recibido:', req.file.filename);
    }
    
    try {
      // Obtener la URL anterior para posible limpieza después
      if (url_documento) {
        const oldResult = await pool.query(
          'SELECT url_documento FROM tesis.tesis WHERE id_tesis = $1',
          [id]
        );
        if (oldResult.rows.length > 0) {
          oldFilePath = oldResult.rows[0].url_documento;
        }
      }
            
      // Llamar a la función de PostgreSQL
      const result = await pool.query(
        `SELECT tesis.editar_tesis($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9 ) AS resultado`,
        [
          id,                                 
          titulo || null,           
          resumen || null,            
          id_carrera || null,   
          anio_elaboracion || null,           
          url_documento,                       
          estudiantes ? JSON.stringify(JSON.parse(estudiantes) || []): null,  
          evaluaciones ? JSON.stringify(JSON.parse(evaluaciones) || []) : null, 
          req.usuario?.id_usuario || null       
        ]
      );
      
      const resultado = result.rows[0].resultado;
      
      if (!resultado.success) {
        // Si falló la BD, eliminar el nuevo archivo subido
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log('Archivo nuevo eliminado por fallo en BD');
        }
        return res.status(resultado.status || 400).json(resultado);
      }
      
      // Si se reemplazó el archivo, eliminar el anterior
      if (resultado.success && url_documento && oldFilePath) {
        // console.log( 'url_documento && oldFilePath>>>> ',url_documento, oldFilePath)
        const oldFullPath = path.join(process.cwd(), oldFilePath);
        if (fs.existsSync(oldFullPath)) {
          fs.unlinkSync(oldFullPath);
          console.log('Archivo anterior eliminado:', oldFilePath);
        }
      }
          
      res.status(resultado.status || 200).json(resultado);
      
    } catch (error) {
      console.error('Error en updateTesis:', error);
      
      // Limpiar archivo nuevo si hay error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log('Archivo nuevo eliminado por error');
      }
      
      res.status(500).json({
        success: false,
        status: 500,
        error: 'Error interno del servidor',
        detalle: error.message
      });
    }
  },



  deleteTesis: async (req, res) => {
    const { id } = req.params;
    const { forzar_fisico = false } = req.query;

    try {
      const result = await pool.query(
        `SELECT tesis.eliminar_tesis($1, $2, $3) AS resultado`,
        [id, req.usuario?.email || 'sistema', forzar_fisico === 'true']
      );

      const resultado = result.rows[0].resultado;

      if (!resultado.success) {
        return res.status(resultado.status || 400).json(resultado);
      }

      res.json(resultado);

    } catch (error) {
      console.error('Error en eliminarTesis:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar la tesis'
      });
    }
  },

  // src/controllers/tesisController.js
 testUpload :async (req, res) => {
    console.log('=== TEST UPLOAD ===');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('req.headers.content-type:', req.headers['content-type']);
    
    if (!req.file) {
        return res.status(400).json({ 
            error: 'No se recibió archivo',
            body: req.body,
            contentType: req.headers['content-type']
        });
    }
    
    res.json({
        success: true,
        file: {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            path: req.file.path
        },
        body: req.body
    });
},


// ============================================
// BÚSQUEDA POR CÉDULA
// ============================================

// Buscar estudiante por cédula
// backend/src/controllers/tesisController.js

searchEstudianteCedula: async (req, res) => {
    const { cedula } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT id_estudiante, nombre_completo, cedula, email
             FROM personas.estudiante
             WHERE cedula ILIKE  '%' || $1 || '%' AND fecha_eliminacion IS NULL`,
            [cedula]
        );
        
        // También puedes usar CONCAT:
        // WHERE cedula ILIKE CONCAT('%', $1)
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Estudiante no encontrado' 
            });
        }
        
        // Si hay múltiples resultados, devolver todos
        res.json({
            success: true,
            data: result.rows,
            multiple: result.rows.length > 1
        });
        
    } catch (error) {
        console.error('Error buscando estudiante:', error);
        res.status(500).json({success: false, error: 'Error interno del servidor' });
    }
},

searchJuradosCedula: async (req, res) => {
    const { cedula } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT id_jurado, nombre_completo, cedula, titulo_profesional
             FROM personas.jurado
             WHERE cedula ILIKE  '%' || $1 || '%'  AND fecha_eliminacion IS NULL`,
            [cedula]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Jurado no encontrado' 
            });
        }
        
        res.json({
            success: true,
            data: result.rows,
            multiple: result.rows.length > 1
        });
        
    } catch (error) {
        console.error('Error buscando jurado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
},

getAniosDisponibles: async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT anio_elaboracion as anio
             FROM tesis.tesis
             WHERE fecha_eliminacion IS NULL
             ORDER BY anio_elaboracion DESC`
        );
        
        const anios = result.rows.map(row => parseInt(row.anio));
        
        res.json({
            success: true,
            data: anios
        });
    } catch (error) {
        console.error('Error obteniendo años disponibles:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

}