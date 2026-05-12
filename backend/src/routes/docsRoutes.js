// backend/src/routes/documentosRoutes.js
import express from 'express';
import { docsController } from '../controllers/docsController.js';

const router = express.Router();

// Rutas 
router.post('/save', docsController.createDoc);
router.put('/update/:id', docsController.updateDoc);
router.delete('/delete/:id', docsController.deleteDoc);
router.get('/byId/:id', docsController.getDocById);
router.get('/', docsController.getDocs);

export default router;