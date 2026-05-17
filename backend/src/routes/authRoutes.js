import express from 'express';
import { authController } from '../controllers/authController.js';
const router = express.Router();

// Definir las rutas
router.post('/send-code', authController.enviarCodigo);
router.post('/resend-code', authController.reenviarCodigo);
router.post('/verify-and-register', authController.verificarYRegistrar);
router.post('/login', authController.login);

router.post('/forgot-password', authController.enviarCodigoRecuperacion);
router.post('/verify-reset-code', authController.verificarCodigoRecuperacion);
router.post('/reset-password', authController.cambiarContrasena);

export default router;