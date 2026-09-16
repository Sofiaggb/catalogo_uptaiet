import express from 'express';
import { materiaController } from '../controllers/materiaController.js';
import { authMiddleware, requireAuth } from '../middlewares/authMiddleware.js';
import { verificarPermiso } from '../middlewares/permisosMiddlewere.js';
const router = express.Router();
router.use(authMiddleware);

// Definir las rutas
router.get('/', materiaController.getMaterias);
router.get('/byId/:id', materiaController.getMateriaById);
router.post('/save',   requireAuth, verificarPermiso('materia', 'crear'), materiaController.createMateria);
router.put('/update/:id', requireAuth,  verificarPermiso('materia', 'editar'), materiaController.updateMateria);

router.delete('/:id',requireAuth, verificarPermiso('materia', 'eliminar'), materiaController.deleteMateria);

export default router;