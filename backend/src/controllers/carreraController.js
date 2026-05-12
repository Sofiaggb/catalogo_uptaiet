import { pool } from "../config/db.js";

export const carreraController = {
  // Obtener tipo carrera
  getTiposCarrera: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT t.id_tipo_carrera, t.nombre FROM catalogo.tipo_carrera  t
        WHERE fecha_eliminacion IS NULL`
      );
      res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({
            success: false,
            error: 'Error al obtener las carreras'
        });
    }
  },

    // Obtener tipo de trabajo segun la carrera seleccionada 
  getTiposTrabajoByCarrera: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT tt.id_tipo_trabajo, tt.nombre 
          FROM catalogo.tipo_trabajo tt
          JOIN catalogo.carrera_tipo_trabajo ctt ON tt.id_tipo_trabajo = ctt.id_tipo_trabajo
          WHERE ctt.id_tipo_carrera = $1 ;` , [id]
      );
      res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({
            success: false,
            error: 'Error al obtener las carreras'
        });
    }
  },

  // Obtener todas las carreras 
  getCarreras: async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.id_carrera, c.nombre, c.descripcion, c.id_tipo_carrera, tc.nombre as tipo_carrera
             FROM catalogo.carrera c
             JOIN catalogo.tipo_carrera tc ON tc.id_tipo_carrera = c.id_tipo_carrera
             WHERE c.fecha_eliminacion IS NULL
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
        'SELECT catalogo.carrera_obtener($1) AS resultado',
        [id]
      );
      const tesisCompleta = result.rows[0].resultado;

      res.json(tesisCompleta);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la carrera' });
    }
  },

  // Crear nueva carrera
  createCarrera: async (req, res) => {
    const { nombre, descripcion, id_tipo_carrera, id_tipo_trabajo } = req.body;

    // Validaciones básicas
    if (!nombre || !id_tipo_carrera) {
      return res.status(400).json({ error: 'Nombre y tipo de carrera son requeridos' });
    }

    try {
      const result = await pool.query(
        `SELECT catalogo.carrera_crear($1, $2, $3, $4, $5) AS resultado`,
        [nombre, descripcion, id_tipo_carrera, id_tipo_trabajo, req.usuario?.id_usuario || null]
      );

      const resultado = result.rows[0].resultado;
      // console.log(resultado)
       res.status(resultado.status || (resultado.success ? 201 : 400)).json(resultado);
    } catch (error) {
      console.error(error);
       res.status(500).json({
        success: false,
        status: 500,
        message: 'Error interno del servidor',
        detalle: error.message
      });
    }
  },

    // update nueva carrera
  updateCarrera: async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, id_tipo_carrera, id_tipo_trabajo } = req.body;

    try {
      const result = await pool.query(
        `SELECT catalogo.carrera_editar($1, $2, $3, $4, $5, $6) AS resultado`,
        [ id, nombre, descripcion, id_tipo_carrera,
          id_tipo_trabajo, req.usuario?.id_usuario || null]
      );

      const resultado = result.rows[0].resultado;
      // console.log(resultado)
       res.status(resultado.status || (resultado.success ? 201 : 400)).json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        status: 500,
        message: 'Error interno del servidor',
        detalle: error.message
      });
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