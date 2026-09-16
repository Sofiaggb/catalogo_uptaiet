import {pool} from '../config/db.js';

export const verificarPermiso = (modulo, accion) => {
  return async (req, res, next) => {
    try {
      const userId = req.usuario.id_usuario; 

      const result = await pool.query(
        `SELECT seguridad.get_permisos_usuario($1, $2, $3) AS get_permisos_usuario`,
        [userId, modulo, accion]
      );

      const puedeAcceder = result.rows[0].get_permisos_usuario;

      if (!puedeAcceder) {
        return res.status(403).json({ 
          success: false,
          message: `No tienes permiso para ${accion} en ${modulo}` 
        });
      }

      next();
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return res.status(500).json({ error: 'Error interno al verificar permisos' });
    }
  };
};