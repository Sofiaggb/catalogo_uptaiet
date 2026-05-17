import express from 'express';
import { carreraController } from '../controllers/carreraController.js';
import { authMiddleware, requireAuth } from '../middlewares/authMiddleware.js';
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

export default router;