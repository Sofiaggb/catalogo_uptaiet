// backend/src/routes/downloadRoutes.js
import express from 'express';
import { downloadController } from '../controllers/downloadController.js';

const router = express.Router();

router.get('/tesis/:id', downloadController.viewTesis);
router.get('/tesis/:id/download-image',downloadController.tesisDownload );

export default router;