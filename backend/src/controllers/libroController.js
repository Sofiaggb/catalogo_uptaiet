// src/controllers/tesisController.js
import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';

export const libroController = {
  createLibro: async (req, res) => {
    const { id_materia, titulo, autor, editorial, year} = req.body;
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
        `SELECT recursos.libro_crear($1, $2, $3, $4, $5, $6,$7) AS resultado`,
        [ id_materia,
          titulo,
          autor ,
          editorial,
          year,
          url_documento || null,
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
      buscar,
      limit = 50,
      page = 1
    } = req.query;

    const offset = (page - 1) * limit;

    try {
      const result = await pool.query(
        `SELECT recursos.libros_listar($1, $2, $3, $4) AS resultado`,
        [id_materia  || null, buscar || null, limit, offset]
      );
      console.log(result)
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
  updateLibro: async (req, res) => {
    const { id } = req.params;
    const { id_materia, titulo, autor, editorial, year} = req.body;
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
               `SELECT recursos.libro_edit($1, $2, $3, $4, $5, $6, $7, $8) AS resultado`,
        [ id,
          id_materia,
          titulo,
          autor ,
          editorial,
          year,
          url_documento || null,
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


}