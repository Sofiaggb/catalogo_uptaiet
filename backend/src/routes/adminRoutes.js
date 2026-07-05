// backend/src/routes/adminRoutes.js
import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';
import {headerController} from '../controllers/headerController.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(requireRole([3]));

// Obtener todas las solicitudes de cambio de rol
router.get('/solicitudes-rol', adminController.obtenerSolicitudesRol);
router.get('/solicitudes-rol/estadisticas', adminController.obtenerEstadisticas);
router.get('/solicitudes-rol/:id', adminController.obtenerSolicitudById);
router.put('/solicitudes-rol/:id/aprobar', adminController.aprobarSolicitud);
router.put('/solicitudes-rol/:id/rechazar', adminController.rechazarSolicitud);

// Rutas para el encabezado
router.post('/encabezado', upload.encabezado.single('encabezado'), headerController.actualizarEncabezado);
router.delete('/encabezado', headerController.eliminarEncabezado);


export default router;