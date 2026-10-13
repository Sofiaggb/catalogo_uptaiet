import express from 'express';
import upload from '../config/multer.js';
import { tesisController } from '../controllers/tesisController.js'; 
import { authMiddleware, requireAuth } from '../middlewares/authMiddleware.js';
import { verificarPermiso } from '../middlewares/permisosMiddlewere.js';
const router = express.Router();
router.use(authMiddleware);

// Definir las rutas

router.get('/', tesisController.getTesis);
router.get('/byId/:id', tesisController.getTesisById);
router.post('/save', requireAuth, verificarPermiso('proyecto', 'crear'), upload.tesis.single('archivo_pdf'),  tesisController.createTesis);
router.put('/upload/:id', requireAuth,  verificarPermiso('proyecto', 'editar'), upload.tesis.single('archivo_pdf'), tesisController.updateTesis);
router.post('/vistas/:id', tesisController.incrementarVistas); // Incrementar vistas
router.get('/estudiantes/cedula/:cedula', tesisController.searchEstudianteCedula);
router.get('/anios', tesisController.getAniosDisponibles); 
router.get('/gestion', requireAuth, verificarPermiso('proyecto', 'aprobar'), tesisController.listarGestion);
router.put('/revisar/:id', requireAuth, verificarPermiso('proyecto', 'aprobar'), tesisController.revisar);
router.get('/pendientes/count', requireAuth, verificarPermiso('proyecto', 'aprobar'), tesisController.contarPendientes);

export default router;
