
import { pool } from '../config/db.js';

// ===== ASOCIACIÓN CARRERA - TIPO TRABAJO =====
export const carreraTipoTrabajoController = {
    // Listar todas las asociaciones
    listar: async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT 
                    ctt.id_carrera_tipo_trabajo,
                    ctt.id_tipo_carrera,
                    ctt.id_tipo_trabajo,
                    ctt.fecha_creacion,
                    ctt.fecha_eliminacion,
                    tc.nombre AS nombre_carrera,
                    tt.nombre AS nombre_trabajo
                 FROM catalogo.carrera_tipo_trabajo ctt
                 JOIN catalogo.tipo_carrera tc ON ctt.id_tipo_carrera = tc.id_tipo_carrera
                 JOIN catalogo.tipo_trabajo tt ON ctt.id_tipo_trabajo = tt.id_tipo_trabajo
                 WHERE ctt.fecha_eliminacion IS NULL
                 ORDER BY tc.nombre, tt.nombre`
            );
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error al listar asociaciones:', error);
            res.status(500).json({ success: false, message: 'Error al listar' });
        }
    },

    // Asociar carrera con tipo de trabajo
      asociar: async (req, res) => {
        const { id_tipo_carrera, id_tipo_trabajo } = req.body;

        if (!id_tipo_carrera || !id_tipo_trabajo) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren id_tipo_carrera y id_tipo_trabajo'
            });
        }

        try {
            const result = await pool.query(
                `SELECT catalogo.asociar_carrera_tipo_trabajo($1, $2) AS resultado`,
                [id_tipo_carrera, id_tipo_trabajo]
            );

            const resultado = result.rows[0].resultado;

            // Verificar si la función devolvió error
            if (!resultado.success) {
                const statusCode = resultado.code === 'CARRERA_NOT_FOUND' || 
                                  resultado.code === 'TRABAJO_NOT_FOUND' ? 404 : 400;
                return res.status(statusCode).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            console.error('Error al asociar:', error);
            res.status(500).json({
                success: false,
                message: 'Error al asociar',
                error: error.message
            });
        }
    },
    
    // Desasociar (soft delete)
    desasociar: async (req, res) => {
        const { id } = req.params;

        try {
            const result = await pool.query(
                `UPDATE catalogo.carrera_tipo_trabajo
                 SET fecha_eliminacion = NOW()
                 WHERE id_carrera_tipo_trabajo = $1 AND fecha_eliminacion IS NULL
                 RETURNING *`,
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Asociación no encontrada'
                });
            }

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error al desasociar:', error);
            res.status(500).json({ success: false, message: 'Error al desasociar' });
        }
    },

    // Obtener tipos de trabajo por carrera (para usar en formularios)
    obtenerPorCarrera: async (req, res) => {
        const { id_tipo_carrera } = req.params;

        try {
            const result = await pool.query(
                `SELECT 
                    tt.id_tipo_trabajo,
                    tt.nombre
                 FROM catalogo.carrera_tipo_trabajo ctt
                 JOIN catalogo.tipo_trabajo tt ON ctt.id_tipo_trabajo = tt.id_tipo_trabajo
                 WHERE ctt.id_tipo_carrera = $1 
                   AND ctt.fecha_eliminacion IS NULL
                   AND tt.fecha_eliminacion IS NULL
                 ORDER BY tt.nombre`,
                [id_tipo_carrera]
            );

            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error al obtener tipos de trabajo por carrera:', error);
            res.status(500).json({ success: false, message: 'Error al obtener' });
        }
    }
};