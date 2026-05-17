// backend/src/routes/documentosRoutes.js
import upload from '../config/multer.js';
import express from 'express';
import { libroController } from '../controllers/libroController.js';
import { authMiddleware, requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// Rutas 
router.post('/save', requireAuth, upload.libros.single('archivo_pdf'),  libroController.createLibro);
router.put('/update/:id',requireAuth,  upload.libros.single('archivo_pdf'), libroController.updateLibro);
router.get('/byId/:id', libroController.getLibroById);
router.get('/', libroController.getLibros);

export default router;