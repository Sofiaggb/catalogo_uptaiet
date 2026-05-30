// backend/src/controllers/auditController.js
import { pool } from "../config/db.js";

export const auditController = {
    // Obtener logs de auditoría
    obtenerLogs: async (req, res) => {
        const { 
            tabla, 
            registro_id, 
            accion, 
            usuario_id,
            fecha_desde,
            fecha_hasta,
            limit = 50, 
            page = 1 
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        try {
            const result = await pool.query(
                `SELECT auditoria.listar_logs_auditoria($1, $2, $3, $4, $5, $6, $7, $8) AS resultado`,
                [
                    tabla || null,
                    registro_id ? parseInt(registro_id) : null,
                    accion || null,
                    usuario_id ? parseInt(usuario_id) : null,
                    fecha_desde || null,
                    fecha_hasta || null,
                    limit,
                    offset
                ]
            );
            
            const resultado = result.rows[0].resultado;
            res.json(resultado);
            
        } catch (error) {
            console.error('Error en obtenerLogs:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al obtener logs' 
            });
        }
    },
    
    // Obtener historial de un registro específico
    obtenerHistorialRegistro: async (req, res) => {
        const { tabla, id } = req.params;
        
        try {
            const result = await pool.query(
                `SELECT 
                    l.*,
                    u.nombre as usuario_nombre,
                    u.email as usuario_email
                 FROM auditoria.log_actividad l
                 LEFT JOIN seguridad.usuario u ON l.id_usuario = u.id_usuario
                 WHERE l.tabla = $1 AND l.registro_id = $2
                 ORDER BY l.fecha DESC`,
                [tabla, id]
            );
            
            res.json({ success: true, data: result.rows });
            
        } catch (error) {
            console.error('Error en obtenerHistorialRegistro:', error);
            res.status(500).json({ success: false, message: 'Error al obtener historial' });
        }
    },
    
    // Obtener estadísticas de auditoría
    obtenerEstadisticas: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    tabla,
                    COUNT(*) as total,
                    COUNT(CASE WHEN accion = 'INSERT' THEN 1 END) as inserts,
                    COUNT(CASE WHEN accion = 'UPDATE' THEN 1 END) as updates,
                    COUNT(CASE WHEN accion = 'DELETE' THEN 1 END) as deletes,
                    COUNT(DISTINCT id_usuario) as usuarios_distintos
                FROM auditoria.log_actividad
                WHERE fecha >= NOW() - INTERVAL '30 days'
                GROUP BY tabla
                ORDER BY total DESC
            `);
            
            res.json({ success: true, data: result.rows });
            
        } catch (error) {
            console.error('Error en obtenerEstadisticas:', error);
            res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
        }
    },

      // Obtener acciones disponibles para filtros
    obtenerAcciones: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT DISTINCT accion 
                FROM auditoria.log_actividad 
                ORDER BY accion
            `);
            
            res.json({ 
                success: true, 
                data: result.rows.map(r => r.accion) 
            });
            
        } catch (error) {
            console.error('Error en obtenerAcciones:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al obtener acciones' 
            });
        }
    },
    
    // Obtener tablas disponibles para filtros
    obtenerTablas: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT DISTINCT esquema, tabla
                FROM auditoria.log_actividad 
                ORDER BY esquema, tabla
            `);
            
            res.json({ 
                success: true, 
                data: result.rows 
            });
            
        } catch (error) {
            console.error('Error en obtenerTablas:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al obtener tablas' 
            });
        }
    }
};