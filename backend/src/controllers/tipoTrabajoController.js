import { pool } from '../config/db.js';

// ===== TIPOS DE TRABAJO =====
export const tipoTrabajoController = {
    listar: async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT id_tipo_trabajo, nombre, 
                TO_CHAR(fecha_creacion, 'DD/MM/YYYY') as fecha_creacion, fecha_eliminacion
                 FROM catalogo.tipo_trabajo
                 ORDER BY nombre`
            );
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error al listar tipos de trabajo:', error);
            res.status(500).json({ success: false, message: 'Error al listar' });
        }
    },

    crear: async (req, res) => {
        const { nombre } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
        }

        try {
            const result = await pool.query(
                `INSERT INTO catalogo.tipo_trabajo (nombre)
                 VALUES ($1)
                 RETURNING *`,
                [nombre]
            );
            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({ success: false, message: 'El tipo de trabajo ya existe' });
            }
            console.error('Error al crear tipo de trabajo:', error);
            res.status(500).json({ success: false, message: 'Error al crear' });
        }
    },

    actualizar: async (req, res) => {
        const { id } = req.params;
        const { nombre } = req.body;

        try {
            const result = await pool.query(
                `UPDATE catalogo.tipo_trabajo
                 SET nombre = COALESCE($1, nombre)
                 WHERE id_tipo_trabajo = $2 AND fecha_eliminacion IS NULL
                 RETURNING *`,
                [nombre, id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Tipo de trabajo no encontrado' });
            }

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error al actualizar tipo de trabajo:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar' });
        }
    },

    eliminar: async (req, res) => {
        const { id } = req.params;

        try {
            // Verificar si tiene asociaciones activas
            const checkResult = await pool.query(
                `SELECT COUNT(*) FROM catalogo.carrera_tipo_trabajo 
                 WHERE id_tipo_trabajo = $1 AND fecha_eliminacion IS NULL`,
                [id]
            );

            if (parseInt(checkResult.rows[0].count) > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar porque está asociado a una carrera'
                });
            }

            const result = await pool.query(
                `UPDATE catalogo.tipo_trabajo
                 SET fecha_eliminacion = NOW()
                 WHERE id_tipo_trabajo = $1 AND fecha_eliminacion IS NULL
                 RETURNING *`,
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Tipo de trabajo no encontrado' });
            }

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error al eliminar tipo de trabajo:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar' });
        }
    }
};
