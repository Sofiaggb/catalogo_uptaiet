import express from 'express';
import { materiaController } from '../controllers/materiaController.js';
import { authMiddleware, requireAuth } from '../middlewares/authMiddleware.js';
const router = express.Router();
router.use(authMiddleware);

// Definir las rutas
router.get('/', materiaController.getMaterias);
router.get('/byId/:id', materiaController.getMateriaById);
router.post('/save', requireAuth,materiaController.createMateria);
router.put('/update/:id',requireAuth, materiaController.updateMateria);

router.delete('/:id',requireAuth, materiaController.deleteMateria);

export default router;