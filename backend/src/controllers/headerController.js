import { pool } from '../config/db.js';
import { getFileUrl, deleteFile } from '../config/multer.js';

export const headerController = {
    actualizarEncabezado: async (req, res) => {
        try {
            // Verificar si el usuario es admin (ya se verifica en el middleware)
            const usuarioId = req.usuario.id_usuario;
            
            // Obtener encabezado actual
            // const currentHeader = await pool.query(
            //     'SELECT valor FROM configuracion WHERE clave = $1',
            //     ['encabezado_imagen']
            // );
            
            // const oldImageUrl = currentHeader.rows[0]?.valor;
            
            // Si hay nueva imagen
            if (req.file) {
                const newImageUrl = getFileUrl('encabezados', req.file.filename);
                
                // Actualizar en base de datos
                await pool.query(
                    `UPDATE configuracion 
                     SET valor = $1, fecha_modificacion = CURRENT_TIMESTAMP, id_usuario_modificacion = $2
                     WHERE clave = 'encabezado_imagen'`,
                    [newImageUrl, usuarioId]
                );
                
                // Eliminar imagen anterior (si existe)
                // if (oldImageUrl) {
                    // deleteFile(oldImageUrl);
                // }
                
                return res.json({
                    success: true,
                    message: 'Encabezado actualizado correctamente',
                    data: { url: newImageUrl }
                });
            }
            
            res.status(400).json({
                success: false,
                message: 'No se envió ninguna imagen '
            });
            
        } catch (error) {
            console.error('Error al actualizar encabezado:', error);
            if (req.file) {
                deleteFile(getFileUrl('encabezados', req.file.filename));
            }
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el encabezado'
            });
        }
    },
    
    // Obtener encabezado (público)
    obtenerEncabezado: async (req, res) => {
        try {
            // Obtener imagen
            const imagenResult = await pool.query(
                'SELECT valor FROM configuracion WHERE clave = $1',
                ['encabezado_imagen']
            );
            
            const imagenUrl = imagenResult.rows[0]?.valor || null;

            res.json({
                success: true,
                data: {
                    imagen: imagenUrl,
                }
            });
            
        } catch (error) {
            console.error('Error al obtener encabezado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el encabezado'
            });
        }
    },
    
    // Eliminar encabezado
    eliminarEncabezado: async (req, res) => {
        try {
            const usuarioId = req.usuario.id_usuario;
            
            // Obtener imagen actual
            const result = await pool.query(
                'SELECT valor FROM configuracion WHERE clave = $1',
                ['encabezado_imagen']
            );
            
            const imageUrl = result.rows[0]?.valor;
            
            if (imageUrl) {
                // Eliminar archivo
                // deleteFile(imageUrl);
                
                // Actualizar base de datos
                await pool.query(
                    `UPDATE configuracion 
                     SET valor = NULL, fecha_modificacion = CURRENT_TIMESTAMP, id_usuario_modificacion = $1 
                     WHERE clave = 'encabezado_imagen'`,
                    [usuarioId]
                );
            }
            
            res.json({
                success: true,
                message: 'Encabezado eliminado correctamente'
            });
            
        } catch (error) {
            console.error('Error al eliminar encabezado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el encabezado'
            });
        }
    }
};
