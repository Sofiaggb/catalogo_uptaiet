import express from 'express';
import { materiaController } from '../controllers/materiaController.js';
const router = express.Router();

// Definir las rutas
router.get('/', materiaController.getMaterias);
router.get('/byId/:id', materiaController.getMateriaById);
router.post('/save', materiaController.createMateria);
router.put('/update/:id', materiaController.updateMateria);

router.delete('/:id', materiaController.deleteMateria);

export default router;