import express from 'express';
import { carreraController } from '../controllers/carreraController.js';
import { authMiddleware, requireAuth } from '../middlewares/authMiddleware.js';
import { tipoCarreraController } from '../controllers/tipoCarreraController.js';
import { tipoTrabajoController } from '../controllers/tipoTrabajoController.js';
import { carreraTipoTrabajoController } from '../controllers/carreraTipoTrabajoController.js';
const router = express.Router();

router.use(authMiddleware);

// Definir las rutas
router.get('/tipos', carreraController.getTiposCarrera);
router.get('/:id/tipos-trabajo', carreraController.getTiposTrabajoByCarrera);


router.get('/', carreraController.getCarreras);
router.get('/byId/:id', carreraController.getCarreraById);
router.post('/save',requireAuth, carreraController.createCarrera);
router.put('/upload/:id',requireAuth, carreraController.updateCarrera);

router.delete('/:id', requireAuth, carreraController.deleteCarrera);

// ===== TIPOS DE CARRERA =====
router.get('/tipos-carrera',  tipoCarreraController.listar);
router.post('/tipos-carrera',  tipoCarreraController.crear);
router.put('/tipos-carrera/:id',  tipoCarreraController.actualizar);
router.delete('/tipos-carrera/:id',  tipoCarreraController.eliminar);

// ===== TIPOS DE TRABAJO =====
router.get('/tipos-trabajo',   tipoTrabajoController.listar);
router.post('/tipos-trabajo', tipoTrabajoController.crear);
router.put('/tipos-trabajo/:id',   tipoTrabajoController.actualizar);
router.delete('/tipos-trabajo/:id',   tipoTrabajoController.eliminar);

// ===== ASOCIACIÓN CARRERA - TIPO TRABAJO =====
router.get('/carrera-tipo-trabajo',  carreraTipoTrabajoController.listar);
router.post('/carrera-tipo-trabajo', carreraTipoTrabajoController.asociar);
router.delete('/carrera-tipo-trabajo/:id', carreraTipoTrabajoController.desasociar);

export default router;