import { pool } from "../config/db.js";

export const carreraController = {
  // Obtener tipo carrera
  getTipoCarrera: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT t.id_tipo_carrera, t.nombre FROM catalogo.tipo_carrera  t
        WHERE fecha_eliminacion IS NULL`
      );
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los tipos de carreras' });
    }
  },

  // Obtener todas las carreras 
  getCarreras: async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id_carrera, nombre, descripcion, id_tipo_carrera
             FROM catalogo.carrera
             WHERE fecha_eliminacion IS NULL
             ORDER BY nombre`
        );
        
        // Formato de respuesta correcto
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener las carreras'
        });
    }
  },

  // Obtener una carrera por ID
  getCarreraById: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'SELECT * FROM catalogo.carrera WHERE id_carrera = $1 AND fecha_eliminacion IS NULL',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Carrera no encontrada' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la carrera' });
    }
  },

  // Crear nueva carrera
  createCarrera: async (req, res) => {
    const { nombre, descripcion, id_tipo_carrera } = req.body;

    // Validaciones básicas
    if (!nombre || !id_tipo_carrera) {
      return res.status(400).json({ error: 'Nombre y tipo de carrera son requeridos' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO catalogo.carrera (nombre, descripcion, id_tipo_carrera) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
        [nombre, descripcion, id_tipo_carrera]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear la carrera' });
    }
  },

  // Actualizar carrera (soft delete)
  deleteCarrera: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'UPDATE catalogo.carrera SET fecha_eliminacion = NOW() WHERE id_carrera = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Carrera no encontrada' });
      }

      res.json({ message: 'Carrera eliminada correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar la carrera' });
    }
  },

}