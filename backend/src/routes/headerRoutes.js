// backend/src/routes/adminRoutes.js
import express from 'express';
import {headerController} from '../controllers/headerController.js';

const router = express.Router();

// Rutas para el encabezado
router.get('/encabezado', headerController.obtenerEncabezado);

export default router;