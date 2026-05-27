// backend/src/routes/profileRoutes.js
import express from 'express';
import { profileController } from '../controllers/perfilController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener estado de solicitud del usuario actual
router.get('/solicitud-estado', profileController.obtenerEstadoSolicitud);

// Enviar solicitud de cambio de rol
router.post('/solicitar-cambio-rol', profileController.enviarSolicitudCambioRol);

// Obtener información del perfil
router.get('/me', profileController.obtenerPerfil);

// Actualizar perfil
router.put('/me', profileController.actualizarPerfil);

export default router;