import express from 'express';
import upload from '../config/multer.js';
import { tesisController } from '../controllers/tesisController.js'; 
const router = express.Router();

// Definir las rutas
router.post('/testtesis', upload.single('archivo_pdf'), tesisController.testUpload);

router.get('/', tesisController.getTesis);
router.get('/byId/:id', tesisController.getTesisById);
router.post('/save', upload.single('archivo_pdf'),  tesisController.createTesis);
router.put('/upload/:id', upload.single('archivo_pdf'), tesisController.updateTesis);
router.delete('/:id', tesisController.deleteTesis);

router.get('/jurados/cedula/:cedula' , tesisController.searchJuradosCedula);
router.get('/estudiantes/cedula/:cedula', tesisController.searchEstudianteCedula);
router.get('/anios', tesisController.getAniosDisponibles); 
export default router;
