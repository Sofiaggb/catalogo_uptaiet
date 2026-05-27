// backend/src/routes/adminRoutes.js
import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(requireRole(['administrador']));

// Obtener todas las solicitudes de cambio de rol
router.get('/solicitudes-rol', adminController.obtenerSolicitudesRol);

// Obtener una solicitud específica
router.get('/solicitudes-rol/:id', adminController.obtenerSolicitudById);

// Aprobar solicitud de cambio de rol
router.put('/solicitudes-rol/:id/aprobar', adminController.aprobarSolicitud);

// Rechazar solicitud de cambio de rol
router.put('/solicitudes-rol/:id/rechazar', adminController.rechazarSolicitud);

// Obtener estadísticas de solicitudes
router.get('/solicitudes-rol/estadisticas', adminController.obtenerEstadisticas);

export default router;