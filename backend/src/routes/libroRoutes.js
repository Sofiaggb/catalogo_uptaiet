// backend/src/routes/documentosRoutes.js
import upload from '../config/multer.js';
import express from 'express';
import { libroController } from '../controllers/libroController.js';
import { authMiddleware, requireAuth } from '../middlewares/authMiddleware.js';
import { verificarPermiso } from '../middlewares/permisosMiddlewere.js';

const router = express.Router();
router.use(authMiddleware);

// Rutas 
router.post('/save', requireAuth, verificarPermiso('libro', 'crear'), upload.libros.single('archivo_pdf'),  libroController.createLibro);
router.put('/update/:id',requireAuth, verificarPermiso('libro', 'editar'),  upload.libros.single('archivo_pdf'), libroController.updateLibro);
router.get('/byId/:id', libroController.getLibroById);
router.get('/tipos-recursos', libroController.getTiposRecursos);

router.get('/', libroController.getLibros);

export default router;