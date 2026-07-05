// backend/controllers/admin/tipoCarreraController.js
import { pool } from '../config/db.js';

// ===== TIPOS DE CARRERA =====
export const tipoCarreraController = {
    // Listar todos los tipos de carrera (incluyendo eliminados)
    listar: async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT id_tipo_carrera, nombre, descripcion, fecha_creacion, fecha_eliminacion
                 FROM catalogo.tipo_carrera
                 ORDER BY nombre`
            );
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error al listar tipos de carrera:', error);
            res.status(500).json({ success: false, message: 'Error al listar' });
        }
    },

    // Crear nuevo tipo de carrera
    crear: async (req, res) => {
        const { nombre, descripcion } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
        }

        try {
            const result = await pool.query(
                `INSERT INTO catalogo.tipo_carrera (nombre, descripcion)
                 VALUES ($1, $2)
                 RETURNING *`,
                [nombre, descripcion]
            );
            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ success: false, message: 'El tipo de carrera ya existe' });
            }
            console.error('Error al crear tipo de carrera:', error);
            res.status(500).json({ success: false, message: 'Error al crear' });
        }
    },

    // Actualizar tipo de carrera
    actualizar: async (req, res) => {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        try {
            const result = await pool.query(
                `UPDATE catalogo.tipo_carrera
                 SET nombre = COALESCE($1, nombre),
                     descripcion = COALESCE($2, descripcion)
                 WHERE id_tipo_carrera = $3 AND fecha_eliminacion IS NULL
                 RETURNING *`,
                [nombre, descripcion, id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Tipo de carrera no encontrado' });
            }

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error al actualizar tipo de carrera:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar' });
        }
    },

    // Eliminar (soft delete) tipo de carrera
    eliminar: async (req, res) => {
        const { id } = req.params;
        const usuarioId = req.usuario.id_usuario;

        try {
            // Verificar si tiene asociaciones activas
            const checkResult = await pool.query(
                `SELECT COUNT(*) FROM catalogo.carrera_tipo_trabajo 
                 WHERE id_tipo_carrera = $1 AND fecha_eliminacion IS NULL`,
                [id]
            );

            if (parseInt(checkResult.rows[0].count) > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar porque tiene tipos de trabajo asociados'
                });
            }

            const result = await pool.query(
                `UPDATE catalogo.tipo_carrera
                 SET fecha_eliminacion = NOW()
                 WHERE id_tipo_carrera = $1 AND fecha_eliminacion IS NULL
                 RETURNING *`,
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Tipo de carrera no encontrado' });
            }

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error al eliminar tipo de carrera:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar' });
        }
    }
};
