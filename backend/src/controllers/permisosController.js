import { pool } from "../config/db.js";

export const permisoController = {
  //   Obtener todos los usuarios (excepto invitados)
  getUsuarios: async (req, res) => {
    try {

      const { page = 1, search = '' } = req.query;
      const limit = 30;
      const offset = (page - 1) * limit;

      const result = await pool.query(
        `SELECT * FROM seguridad.obtener_usuarios_administrables($1, $2, $3)`,
        [search || null, offset, limit]
      );

      const total = result.rows[0]?.total_usuarios || 0;
      res.json({
        success: true,
        data: result.rows.map(({ total_usuarios, ...usuario }) => usuario), // Quitar el count
        count: result.rows.length,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener los usuarios",
      });
    }
  },

  //  Obtener la matriz de permisos de un usuario específico
  getPermisosUsuario: async (req, res) => {
    const { id } = req.params; // Tu ruta usa :id
    // console.log('SELECT * FROM seguridad.obtener_permisos_usuario($1)',id)
    try {
      const result = await pool.query(
        `SELECT * FROM seguridad.obtener_permisos_usuario($1)`,
        [id]
      );

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener los permisos",
      });
    }
  },

  //  Dar un permiso EXTRA
  asignarPermiso: async (req, res) => {
    const { id_usuario, id_permiso } = req.body;

  // console.log('SELECT seguridad.asignar_permiso_usuario($1, $2)', id_usuario, id_permiso)
    try {
      const result = await pool.query(
        `SELECT seguridad.asignar_permiso_usuario($1, $2) AS resultado`,
        [id_usuario, id_permiso]
      );

      const resultado = result.rows[0].resultado;
      res.status(resultado.status || (resultado.success ? 201 : 400)).json(resultado);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        success: false,
        error: "Error al asignar el permiso",
      });
    }
  },

  //  Bloquear un permiso (quitarlo aunque sea del rol)
  bloquearPermiso: async (req, res) => {
    const { id_usuario, id_permiso } = req.body;
// console.log('SELECT seguridad.bloquear_permiso_usuario($1, $2)', id_usuario, id_permiso)
    try {
      const result = await pool.query(
        `SELECT seguridad.bloquear_permiso_usuario($1, $2) AS resultado`,
        [id_usuario, id_permiso]
      );

      const resultado = result.rows[0].resultado;
      res.status(resultado.status || (resultado.success ? 201 : 400)).json(resultado);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        success: false,
        error: "Error al bloquear el permiso",
      });
    }
  },

  // Limpiar permisos (restablecer al rol base)
  limpiarPermisos: async (req, res) => {
    const { id_usuario } = req.body;

    try {
      const result = await pool.query(
        `SELECT seguridad.limpiar_permisos_usuario($1) AS resultado`,
        [id_usuario]
      );

      const resultado = result.rows[0].resultado;
      res.status(resultado.status || (resultado.success ? 201 : 400)).json(resultado);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        success: false,
        error: "Error al limpiar los permisos",
      });
    }
  },
};