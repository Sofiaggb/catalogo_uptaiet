// backend/src/controllers/adminController.js
import { pool } from "../config/db.js";

export const adminController = {
  // Obtener todas las solicitudes de cambio de rol
  obtenerSolicitudesRol: async (req, res) => {
    const { estado, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
      let query = `
        SELECT 
          s.id_solicitud,
          s.justificacion,
          s.estado,
          s.fecha_solicitud,
          s.fecha_respuesta,
          s.comentario_admin,
          u.id_usuario,
          u.nombre as usuario_nombre,
          u.email as usuario_email,
          r_actual.nombre as rol_actual,
          r_solicitado.nombre as rol_solicitado
        FROM seguridad.solicitud_rol s
        JOIN seguridad.usuario u ON s.id_usuario = u.id_usuario
        JOIN seguridad.rol r_actual ON u.id_rol = r_actual.id_rol
        JOIN seguridad.rol r_solicitado ON s.rol_solicitado = r_solicitado.id_rol
        WHERE s.fecha_eliminacion IS NULL
      `;
      
      const params = [];
      
      if (estado) {
        query += ` AND s.estado = $${params.length + 1}`;
        params.push(estado);
      }
      
      query += ` ORDER BY s.fecha_solicitud DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      // Contar total
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM seguridad.solicitud_rol WHERE fecha_eliminacion IS NULL ${estado ? 'AND estado = $1' : ''}`,
        estado ? [estado] : []
      );
      
      res.json({
        success: true,
        data: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        }
      });
      
    } catch (error) {
      console.error('Error en obtenerSolicitudesRol:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener las solicitudes' 
      });
    }
  },

  // Obtener una solicitud específica
  obtenerSolicitudById: async (req, res) => {
    const { id } = req.params;
    
    try {
      const result = await pool.query(
        `SELECT 
          s.*,
          u.nombre as usuario_nombre,
          u.email as usuario_email,
          r_actual.nombre as rol_actual,
          r_solicitado.nombre as rol_solicitado
         FROM seguridad.solicitud_rol s
         JOIN seguridad.usuario u ON s.id_usuario = u.id_usuario
         JOIN seguridad.rol r_actual ON u.id_rol = r_actual.id_rol
         JOIN seguridad.rol r_solicitado ON s.rol_solicitado = r_solicitado.id_rol
         WHERE s.id_solicitud = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Solicitud no encontrada' 
        });
      }
      
      res.json({ 
        success: true, 
        data: result.rows[0] 
      });
      
    } catch (error) {
      console.error('Error en obtenerSolicitudById:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener la solicitud' 
      });
    }
  },

  // Aprobar solicitud
  aprobarSolicitud: async (req, res) => {
    const { id } = req.params;
    const { comentario } = req.body;
    const adminId = req.usuario.id_usuario;
    
    try {
      const result = await pool.query(
        `SELECT seguridad.aprobar_solicitud_rol($1, $2, $3) AS resultado`,
        [id, adminId, comentario || null]
      );
      
      const resultado = result.rows[0].resultado;
      res.json(resultado);
      
    } catch (error) {
      console.error('Error en aprobarSolicitud:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al aprobar la solicitud' 
      });
    }
  },

  // Rechazar solicitud
  rechazarSolicitud: async (req, res) => {
    const { id } = req.params;
    const { comentario } = req.body;
    const adminId = req.usuario.id_usuario;
    
    try {
      const result = await pool.query(
        `SELECT seguridad.rechazar_solicitud_rol($1, $2, $3) AS resultado`,
        [id, adminId, comentario || null]
      );
      
      const resultado = result.rows[0].resultado;
      res.json(resultado);
      
    } catch (error) {
      console.error('Error en rechazarSolicitud:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al rechazar la solicitud' 
      });
    }
  },

  // Obtener estadísticas de solicitudes
  obtenerEstadisticas: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as aprobadas,
          COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) as rechazadas,
          COUNT(*) as total
         FROM seguridad.solicitud_rol
         WHERE fecha_eliminacion IS NULL`
      );
      
      res.json({ 
        success: true, 
        data: result.rows[0] 
      });
      
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener estadísticas' 
      });
    }
  }
};