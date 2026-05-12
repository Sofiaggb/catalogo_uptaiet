import { pool } from "../config/db.js";

export const materiaController = {
  // Obtener todas las carreras
  getMaterias: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT m.id_materia, m.nombre
             FROM catalogo.materia m
             WHERE m.fecha_eliminacion IS NULL
             ORDER BY m.nombre`,
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

  // Obtener una carrera por ID
  getMateriaById: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT m.id_materia, m.nombre
          FROM catalogo.materia m
          WHERE m.id_materia = $1 `,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Materia no encontrada",
        });
      }

      res.json({
        success: true,
        status: 200,
        data: result.rows[0], // ← objeto, no array
      });
    } catch (error) {
      console.error(error);
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Error al obtener la materia',
            error: error.message
        });
    }
  },

  // Crear nueva carrera
  createMateria: async (req, res) => {
    const { nombre } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res
        .status(400)
        .json({ error: "Nombre de la materia es requeridos" });
    }

    try {
      const result = await pool.query(
        ` SELECT catalogo.materia_crear($1, $2) AS resultado`,
        [nombre, req.usuario?.id_usuario || null],
      );

      const resultado = result.rows[0].resultado;
      // console.log(resultado)
      res.status(resultado.status || (resultado.success ? 201 : 400))
        .json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        status: 500,
        message: "Error interno del servidor",
        detalle: error.message,
      });
    }
  },

  // update nueva carrera
  updateMateria: async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    try {
      const result = await pool.query(
        `SELECT catalogo.materia_editar($1, $2, $3) AS resultado`,
        [
          id,
          nombre,
          req.usuario?.id_usuario || null,
        ],
      );

      const resultado = result.rows[0].resultado;
      // console.log(resultado)
      res
        .status(resultado.status || (resultado.success ? 201 : 400))
        .json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        status: 500,
        message: "Error interno del servidor",
        detalle: error.message,
      });
    }
  },

  deleteMateria: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `UPDATE catalogo.materia 
             SET fecha_eliminacion = NOW() 
             WHERE id_materia = $1 
             AND fecha_eliminacion IS NULL
             RETURNING id_materia`,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "materia no encontrada",
        });
      }

      res.json({
        success: true,
        message: "materia eliminada correctamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error al eliminar la carrmateriaera",
      });
    }
  },
};
