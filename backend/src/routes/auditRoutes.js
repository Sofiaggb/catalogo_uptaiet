// backend/src/routes/auditRoutes.js
import express from 'express';
import { auditController } from '../controllers/auditController.js';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole([3])); // Solo administradores

router.get('/logs', auditController.obtenerLogs);
router.get('/historial/:tabla/:id', auditController.obtenerHistorialRegistro);
router.get('/estadisticas', auditController.obtenerEstadisticas);

router.get('/acciones', auditController.obtenerAcciones);
router.get('/tablas', auditController.obtenerTablas);

export default router;