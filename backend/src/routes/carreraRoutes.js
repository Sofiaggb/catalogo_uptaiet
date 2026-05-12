import express from 'express';
import { carreraController } from '../controllers/carreraController.js';
const router = express.Router();

// Definir las rutas
router.get('/tipos', carreraController.getTiposCarrera);
router.get('/:id/tipos-trabajo', carreraController.getTiposTrabajoByCarrera);


router.get('/', carreraController.getCarreras);
router.get('/byId/:id', carreraController.getCarreraById);
router.post('/save', carreraController.createCarrera);
router.put('/upload/:id', carreraController.updateCarrera);

router.delete('/:id', carreraController.deleteCarrera);

export default router;