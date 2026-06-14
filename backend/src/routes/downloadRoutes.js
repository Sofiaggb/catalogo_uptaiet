// backend/src/routes/downloadRoutes.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fromPath } from 'pdf2pic';
import { fileURLToPath } from 'url';
import {pool} from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Crear carpeta temporal si no existe
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

router.get('/tesis/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // 1. Obtener la ruta del archivo
        const result = await pool.query(
            'SELECT url_documento FROM tesis.tesis WHERE id_tesis = $1 AND fecha_eliminacion IS NULL',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tesis no encontrada' });
        }
        
        const filePath = path.join(__dirname, '../../', result.rows[0].url_documento);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }
        
        // 2. Configurar conversión de PDF a imágenes
        const options = {
            density: 100,           // Calidad de la imagen
            saveFilename: `tesis_${id}`,
            savePath: tempDir,
            format: 'png',
            width: 900,             // Ancho de la imagen
            height: 1200,           // Alto de la imagen
            quality: 90,            // Calidad JPEG
        };
        
        const convert = fromPath(filePath, options);
        
        // 3. Convertir todas las páginas (-1 = todas)
        const images = await convert.bulk(-1);
        
        // 4. Generar HTML con las imágenes
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Visualizador de Tesis - UPTAIET</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
                <style>
                    * {
                        user-select: none !important;
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                    }
                    body {
                        background: #1a1a1a;
                        margin: 0;
                        padding: 20px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                    }
                    .container {
                        max-width: 1000px;
                        margin: 0 auto;
                    }
                    .page {
                        background: white;
                        margin-bottom: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        overflow: hidden;
                    }
                    .page img {
                        width: 100%;
                        height: auto;
                        display: block;
                        pointer-events: none;
                    }
                    .page-footer {
                        text-align: center;
                        padding: 10px;
                        background: #f5f5f5;
                        color: #666;
                        font-size: 13px;
                        border-top: 1px solid #e0e0e0;
                    }
                    .controls {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background: rgba(0,0,0,0.8);
                        padding: 10px 18px;
                        border-radius: 30px;
                        color: white;
                        font-size: 13px;
                        font-family: monospace;
                        z-index: 1000;
                        backdrop-filter: blur(5px);
                    }
                    .watermark {
                        position: fixed;
                        bottom: 20px;
                        left: 20px;
                        background: rgba(0,0,0,0.6);
                        padding: 6px 14px;
                        border-radius: 20px;
                        color: #ffcc00;
                        font-size: 11px;
                        font-family: monospace;
                        z-index: 1000;
                        backdrop-filter: blur(5px);
                    }
                    .info {
                        text-align: center;
                        padding: 15px;
                        color: #ccc;
                        font-size: 14px;
                    }
                    @media print {
                        body {
                            background: white;
                            padding: 0;
                        }
                        .controls, .watermark, .info {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
        `;
        
        // Agregar cada página como imagen
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            // Leer el archivo de imagen
            const imageBuffer = fs.readFileSync(image.path);
            const imageBase64 = imageBuffer.toString('base64');
            
            html += `
                <div class="page">
                    <img src="data:image/png;base64,${imageBase64}" alt="Página ${i + 1}" loading="lazy" />
                    <div class="page-footer">
                        Página ${i + 1} de ${images.length}
                    </div>
                </div>
            `;
            
            // Eliminar archivo temporal después de usarlo
            fs.unlinkSync(image.path);
        }
        
        html += `
                    <div class="info">
                        📄 Documento protegido | ${images.length} páginas
                    </div>
                </div>
                <div class="controls">
                    🔒 ${images.length} páginas | Documento protegido
                </div>
                <div class="watermark">
                    UPTAIET - Acceso público | ${new Date().toLocaleDateString()}
                </div>
                <script>
                    // Deshabilitar clic derecho
                    document.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        return false;
                    });
                    
                    // Deshabilitar atajos de teclado
                    document.addEventListener('keydown', (e) => {
                        if (e.ctrlKey || e.metaKey) {
                            if (e.key === 'c' || e.key === 's' || e.key === 'p' || e.key === 'u') {
                                e.preventDefault();
                                alert('📢 Este documento está protegido. No se permite copiar el contenido.');
                            }
                        }
                    });
                    
                    // Deshabilitar arrastrar imágenes
                    document.querySelectorAll('img').forEach(img => {
                        img.setAttribute('draggable', 'false');
                        img.addEventListener('dragstart', (e) => {
                            e.preventDefault();
                            return false;
                        });
                    });
                    
                    console.log('✅ Documento cargado - ${images.length} páginas');
                </script>
            </body>
            </html>
        `;
        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
        
    } catch (error) {
        console.error('Error al convertir PDF:', error);
        
        // Fallback: servir el PDF original si falla la conversión
        try {
            const result = await pool.query(
                'SELECT url_documento FROM tesis.tesis WHERE id_tesis = $1',
                [id]
            );
            const filePath = path.join(__dirname, '../../', result.rows[0].url_documento);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="tesis_${id}.pdf"`);
            res.sendFile(filePath);
        } catch (fallbackError) {
            res.status(500).json({ error: 'Error al procesar el documento' });
        }
    }
});

export default router;