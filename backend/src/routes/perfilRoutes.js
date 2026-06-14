// backend/src/routes/profileRoutes.js
import express from 'express';
import { profileController } from '../controllers/perfilController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/solicitud-estado', profileController.obtenerEstadoSolicitud);
router.post('/solicitar-cambio-rol', profileController.enviarSolicitudCambioRol);
router.get('/me', profileController.obtenerPerfil);
router.put('/me', profileController.actualizarPerfil);

router.post('/foto', upload.perfil.single('foto'), profileController.subirFotoPerfil); // Subir foto de perfil
router.get('/foto', profileController.obtenerFotoPerfil); // Obtener foto de perfil
router.delete('/foto', profileController.eliminarFotoPerfil); // Eliminar foto de perfil

export default router;