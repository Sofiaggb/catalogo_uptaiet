// src/controllers/tesisController.js
import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';

export const libroController = {
  createLibro: async (req, res) => {
    const { id_materia, titulo, autor, editorial, year, id_tipo_recurso } = req.body;
    // Obtener la ruta del archivo subido (si existe)
    let url_documento = null;
    console.log('req.file',req.file)
     if (req.file) {
        url_documento = `/uploads/libros/${req.file.filename}`;
        console.log('Archivo recibido:', req.file.filename);
    } else {
        console.log('No se recibió ningún archivo');
    }

    try {
      const result = await pool.query(
        `SELECT recursos.libro_crear($1, $2, $3, $4, $5, $6, $7, $8) AS resultado`,
        [ id_materia,
          titulo,
          autor ,
          editorial,
          year,
          url_documento || null,
          req.usuario?.id_usuario || null,
          id_tipo_recurso
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
      console.error('Error en createlibro:', error);
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


  getLibroById: async (req, res) => {
    const { id } = req.params;

    try {
      // Llamar a la función PostgreSQL (SOLO UNA CONSULTA)
      const result = await pool.query(
        'SELECT recursos.libro_obtener($1) AS resultado',
        [id]
      );

      // La función devuelve JSONB, PostgreSQL lo parsea automáticamente
      const libro = result.rows[0].resultado;

      res.json(libro);

    } catch (error) {
      console.error('Error en get libro by id:', error);

      // Manejar error específico de "libro no encontrada"
      if (error.message.includes('libro no encontrada')) {
        return res.status(404).json({
          error: 'libro no encontrada',
          message: error.message
        });
      }

      res.status(500).json({
        error: 'Error al obtener la libro',
        detalle: error.message
      });
    }
  },

  getLibros: async (req, res) => {
    const {
      id_materia,
      id_tipo_recurso,  
      anio,           
      buscar,
      limit = 50,
      page = 1
    } = req.query;

    const offset = (page - 1) * limit;

    try {
      const result = await pool.query(
        `SELECT recursos.libros_listar($1, $2, $3, $4, $5, $6) AS resultado`,
        [
          id_materia || null,
          id_tipo_recurso || null,  // 👈 NUEVO
          anio || null,             // 👈 NUEVO
          buscar || null,
          limit,
          offset
        ]
      );
      const resultado = result.rows[0].resultado;
      res.json(resultado);

    } catch (error) {
      console.error('Error en getLibros:', error);
      res.status(500).json({
        success: false,
        error: 'Error al listar los recursos'
      });
    }
  },
  
  // Editar tesis existente
  updateLibro: async (req, res) => {
    const { id } = req.params;
    const { id_materia, titulo, autor, editorial, year, id_tipo_recurso } = req.body;
    let url_documento = null;
    let oldFilePath = null;
    
    // Procesar nuevo archivo si existe
    if (req.file) {
      url_documento = `/uploads/libros/${req.file.filename}`;
      console.log('Nuevo archivo recibido:', req.file.filename);
    }
    
    try {
      // Obtener la URL anterior para posible limpieza después
      if (url_documento) {
        const oldResult = await pool.query(
          'SELECT url_documento FROM recursos.libro WHERE id_libro = $1',
          [id]
        );
        if (oldResult.rows.length > 0) {
          oldFilePath = oldResult.rows[0].url_documento;
        }
      }
            
      // Llamar a la función de PostgreSQL
      const result = await pool.query(
               `SELECT recursos.libro_edit($1, $2, $3, $4, $5, $6, $7, $8, $9) AS resultado`,
        [ id,
          id_materia,
          titulo,
          autor ,
          editorial,
          year,
          url_documento || null,
          req.usuario?.id_usuario || null,
          id_tipo_recurso
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
      console.error('Error en updatelibro:', error);
      
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

  getTiposRecursos: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT t.id_tipo_recurso, t.nombre
             FROM recursos.tipo_recurso  t
             WHERE t.fecha_eliminacion IS NULL
             ORDER BY t.nombre`,
      );

      // Formato de respuesta
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener las carreras",
      });
    }
  },

  // RECURSOS POR GESTIONAR 
   listarGestion: async (req, res) => {
    const { 
      buscar, 
      id_materia,
      id_tipo_recurso,
      anio,
      estado = 2, 
      orden = 'reciente', 
      page = 1, 
      limit = 20 
    } = req.query;
    const offset = (page - 1) * limit;

    try {
      const result = await pool.query(
        `SELECT recursos.listar_libros_gestion($1, $2, $3, $4, $5, $6, $7, $8) AS resultado`,
        [
          buscar || null,
          id_materia || null,
          id_tipo_recurso || null,
          anio || null,
          parseInt(estado),
          orden,
          offset,
          limit
        ]
      );
      res.json(result.rows[0].resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  //  Aprobar/Rechazar
  revisar: async (req, res) => {
    const { id } = req.params;
    const { aprobar, comentario } = req.body;
    const id_revisor = req.usuario.id_usuario;

    if (typeof aprobar !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "El campo 'aprobar' debe ser true o false"
      });
    }

    try {
      const result = await pool.query(
        `SELECT recursos.revisar_libro($1, $2, $3, $4) AS resultado`,
        [id, id_revisor, aprobar, comentario || null]
      );
      const resultado = result.rows[0].resultado;
      res.status(resultado.status || 200).json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  //  Contar pendientes
  contarPendientes: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS total 
        FROM recursos.libro  
        WHERE id_estado = 2 
          AND fecha_eliminacion IS NULL`
      );
      res.json({
        success: true,
        status: 200,
        data: { total: parseInt(result.rows[0].total) }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

    //  Años disponibles
  getAniosDisponibles: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT recursos.get_anios_libros() AS resultado`
      );
      res.json(result.rows[0].resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
}