// backend/src/controllers/profileController.js
import { pool } from "../config/db.js";
import { deleteFile, getFileUrl } from "../config/multer.js";

export const profileController = {
  // Obtener estado de solicitud del usuario actual
  obtenerEstadoSolicitud: async (req, res) => {
    const usuarioId = req.usuario.id_usuario;
    
    try {
      const result = await pool.query(
        `SELECT 
          s.id_estado,
          e.nombre_estado as estado,
          s.justificacion,
          s.comentario_admin,
          s.fecha_solicitud,
          s.fecha_respuesta,
          r.nombre as rol_solicitado_nombre
         FROM seguridad.solicitud_rol s
         JOIN control.estado e ON e.id_estado = s.id_estado
         JOIN seguridad.rol r ON s.id_rol_solicitado = r.id_rol
         WHERE s.id_usuario = $1 
         AND s.fecha_eliminacion IS NULL
         ORDER BY s.fecha_solicitud DESC
         LIMIT 1`,
        [usuarioId]
      );
      
      if (result.rows.length === 0) {
        return res.json({ 
          success: true, 
          data: null 
        });
      }
      
      res.json({ 
        success: true, 
        data: result.rows[0] 
      });
      
    } catch (error) {
      console.error('Error en obtenerEstadoSolicitud:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener el estado de la solicitud' 
      });
    }
  },

  // Enviar solicitud de cambio de rol
  enviarSolicitudCambioRol: async (req, res) => {
    const usuarioId = req.usuario.id_usuario;
    const { id_rol, cedula, nombre_completo,justificacion } = req.body;
    // console.log('id_rol, cedula, nombre_completo,justificacion  >>>>', id_rol, cedula, nombre_completo,justificacion )

    try {
      const result = await pool.query(
        `SELECT seguridad.crear_solicitud_rol($1, $2, $3, $4, $5) AS resultado`,
        [usuarioId, id_rol, cedula, nombre_completo, justificacion ]
      );
    // console.log('result >>>>', result)
      
      const resultado = result.rows[0].resultado;
      res.json(resultado);
      
    } catch (error) {
      console.error('Error en enviarSolicitudCambioRol:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al enviar la solicitud' 
      });
    }
  },

  // Obtener perfil del usuario
  obtenerPerfil: async (req, res) => {
    const usuarioId = req.usuario.id_usuario;
    
    try {
      const result = await pool.query(
        `SELECT 
          u.id_usuario,
          u.email,
          u.nombre,
          u.foto_perfil,
          u.fecha_creacion,
          r.id_rol,
          r.nombre as rol
         FROM seguridad.usuario u
         JOIN seguridad.rol r ON u.id_rol = r.id_rol
         WHERE u.id_usuario = $1
         AND u.fecha_eliminacion IS NULL`,
        [usuarioId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
      }
      
      res.json({ 
        success: true, 
        data: result.rows[0] 
      });
      
    } catch (error) {
      console.error('Error en obtenerPerfil:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener el perfil' 
      });
    }
  },


  // Subir foto de perfil
    subirFotoPerfil: async (req, res) => {
        const usuarioId = req.usuario.id_usuario;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se recibió ninguna imagen'
            });
        }
        
        const urlFoto = getFileUrl('perfiles', req.file.filename);
        
        try {
            // Obtener foto anterior para eliminarla
            const oldPhoto = await pool.query(
                'SELECT foto_perfil FROM seguridad.usuario WHERE id_usuario = $1',
                [usuarioId]
            );
            
            const oldPhotoUrl = oldPhoto.rows[0]?.foto_perfil;
            
            // Actualizar foto
            const result = await pool.query(
                `SELECT seguridad.actualizar_foto_perfil($1, $2) AS resultado`,
                [usuarioId, urlFoto]
            );
            
            const resultado = result.rows[0].resultado;
            
            if (resultado.success && oldPhotoUrl) {
                // Eliminar foto anterior
                deleteFile(oldPhotoUrl);
            }
            
            res.json(resultado);
            
        } catch (error) {
            console.error('Error en subirFotoPerfil:', error);
            // Eliminar archivo subido si hay error
            if (req.file) {
                deleteFile(urlFoto);
            }
            res.status(500).json({
                success: false,
                message: 'Error al subir la foto'
            });
        }
    },
    
    // Obtener foto de perfil
    obtenerFotoPerfil: async (req, res) => {
        const usuarioId = req.usuario.id_usuario;
        
        try {
            const result = await pool.query(
                'SELECT foto_perfil FROM seguridad.usuario WHERE id_usuario = $1',
                [usuarioId]
            );
            
            res.json({
                success: true,
                data: { foto_perfil: result.rows[0]?.foto_perfil || null }
            });
            
        } catch (error) {
            console.error('Error en obtenerFotoPerfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la foto'
            });
        }
    },
    
    // Eliminar foto de perfil
    eliminarFotoPerfil: async (req, res) => {
        const usuarioId = req.usuario.id_usuario;
        
        try {
            const result = await pool.query(
                'SELECT foto_perfil FROM seguridad.usuario WHERE id_usuario = $1',
                [usuarioId]
            );
            
            const oldPhotoUrl = result.rows[0]?.foto_perfil;
            
            if (oldPhotoUrl) {
                // Eliminar archivo
                deleteFile(oldPhotoUrl);
                
                // Actualizar base de datos
                await pool.query(
                    'UPDATE seguridad.usuario SET foto_perfil = NULL WHERE id_usuario = $1',
                    [usuarioId]
                );
            }
            
            res.json({
                success: true,
                message: 'Foto eliminada correctamente'
            });
            
        } catch (error) {
            console.error('Error en eliminarFotoPerfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la foto'
            });
        }
    },

//   hacer funcion para esto 

  // Actualizar perfil
  actualizarPerfil: async (req, res) => {
    const usuarioId = req.usuario.id_usuario;
    const { nombre, email } = req.body;
    console.log(' hacer funcion lapara esto  actualizarPerfil')
    try {
      let query = 'UPDATE seguridad.usuario SET ';
      const params = [];
      const updates = [];
      
      if (nombre) {
        updates.push(`nombre = $${params.length + 1}`);
        params.push(nombre);
      }
      
      if (email) {
        updates.push(`email = $${params.length + 1}`);
        params.push(email);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No hay campos para actualizar' 
        });
      }
      
      query += updates.join(', ');
      query += ` WHERE id_usuario = $${params.length + 1} RETURNING id_usuario`;
      params.push(usuarioId);
      
      await pool.query(query, params);
      
      res.json({ 
        success: true, 
        message: 'Perfil actualizado correctamente' 
      });
      
    } catch (error) {
      console.error('Error en actualizarPerfil:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al actualizar el perfil' 
      });
    }
  }
};