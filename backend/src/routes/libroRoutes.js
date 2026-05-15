// backend/src/routes/documentosRoutes.js
import upload from '../config/multer.js';
import express from 'express';
import { libroController } from '../controllers/libroController.js';

const router = express.Router();

// Rutas 
router.post('/save',  upload.libros.single('archivo_pdf'),  libroController.createLibro);
router.put('/update/:id',  upload.libros.single('archivo_pdf'), libroController.updateLibro);
router.delete('/delete/:id', libroController.deleteLibro);
router.get('/byId/:id', libroController.getLibroById);
router.get('/', libroController.getLibros);

export default router;