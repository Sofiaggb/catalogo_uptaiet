import express from 'express';
import upload from '../config/multer.js';
import { tesisController } from '../controllers/tesisController.js'; 
import { authMiddleware, requireAuth } from '../middlewares/authMiddleware.js';
const router = express.Router();
router.use(authMiddleware);

// Definir las rutas
router.post('/testtesis', upload.tesis.single('archivo_pdf'), tesisController.testUpload);

router.get('/', tesisController.getTesis);
router.get('/byId/:id', tesisController.getTesisById);
router.post('/save', requireAuth, upload.tesis.single('archivo_pdf'),  tesisController.createTesis);
router.put('/upload/:id', requireAuth, upload.tesis.single('archivo_pdf'), tesisController.updateTesis);
router.delete('/:id',requireAuth, tesisController.deleteTesis);

router.get('/jurados/cedula/:cedula' , tesisController.searchJuradosCedula);
router.get('/estudiantes/cedula/:cedula', tesisController.searchEstudianteCedula);
router.get('/anios', tesisController.getAniosDisponibles); 
export default router;
