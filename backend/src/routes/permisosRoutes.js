import express from 'express';
import { authMiddleware, requireAuth } from '../middlewares/authMiddleware.js';
import { permisoController } from '../controllers/permisosController.js';

const router = express.Router();

// Protegemos todas las rutas
router.use(authMiddleware);

router.get('/byId/:id', requireAuth, permisoController.getPermisosUsuario);

router.post('/asignar', requireAuth, permisoController.asignarPermiso);
router.post('/bloquear', requireAuth, permisoController.bloquearPermiso);
router.post('/limpiar', requireAuth, permisoController.limpiarPermisos);

export default router;