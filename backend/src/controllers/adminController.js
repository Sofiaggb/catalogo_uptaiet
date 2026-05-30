// backend/src/controllers/adminController.js
import { pool } from "../config/db.js";

export const adminController = {
  // Obtener todas las solicitudes de cambio de rol (usando función PostgreSQL)
  obtenerSolicitudesRol: async (req, res) => {
    const { estado, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
      const result = await pool.query(
        `SELECT seguridad.listar_solicitudes_rol($1, $2, $3) AS resultado`,
        [estado || null, limit, offset]
      );
      
      const resultado = result.rows[0].resultado;
      res.json(resultado);
      
    } catch (error) {
      console.error('Error en obtenerSolicitudesRol:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener las solicitudes' 
      });
    }
  },

  // Obtener estadísticas de solicitudes
  obtenerEstadisticas: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT seguridad.obtener_estadisticas_solicitudes() AS resultado`
      );
       
      const resultado = result.rows[0].resultado;
      res.json(resultado);
      
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener estadísticas' 
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
         JOIN seguridad.rol r_solicitado ON s.id_rol_solicitado = r_solicitado.id_rol
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

  
};