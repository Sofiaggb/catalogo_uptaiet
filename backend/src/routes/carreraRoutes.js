import express from 'express';
import { carreraController } from '../controllers/carreraController.js';
const router = express.Router();

// Definir las rutas
router.get('/tipos', carreraController.getTipoCarrera);

router.get('/', carreraController.getCarreras);
router.get('/:id', carreraController.getCarreraById);
router.post('/save', carreraController.createCarrera);
router.delete('/:id', carreraController.deleteCarrera);

export default router;