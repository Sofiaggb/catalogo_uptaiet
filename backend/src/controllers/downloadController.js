

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';
//   usar una imagen como marca de agua
import { PDFDocument, rgb, degrees } from 'pdf-lib';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a la imagen de marca de agua
const WATERMARK_PATH = path.join(__dirname, '../assets/watermark.png');


export const downloadController = {

    viewTesis: async (req, res) => {
        const { id } = req.params;
console.log('si pasa ')
        try {
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

            // Leer la imagen de marca de agua y convertirla a base64
            let watermarkBase64 = '';
            try {
                if (fs.existsSync(WATERMARK_PATH)) {
                    const watermarkBuffer = fs.readFileSync(WATERMARK_PATH);
                    watermarkBase64 = `data:image/png;base64,${watermarkBuffer.toString('base64')}`;
                }
            } catch (error) {
                console.warn('No se pudo cargar la marca de agua:', error);
            }

            const pdfUrl = `/uploads/${path.basename(path.dirname(filePath))}/${path.basename(filePath)}`;
            const fileName = path.basename(filePath);

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualizador de Documentos - UPTAIET</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            user-select: none !important;
            -webkit-user-select: none !important;
        }
        
        body {
            background: #525659;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .toolbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #323639;
            color: white;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            z-index: 1000;
            border-bottom: 1px solid #4a4e52;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .zoom-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .zoom-controls button {
            background: #4a4e52;
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        
        .zoom-controls button:hover {
            background: #5a5e62;
        }
        
        .zoom-controls span {
            font-size: 14px;
            min-width: 50px;
            text-align: center;
        }
        
        .watermark-text {
            font-size: 12px;
            color: #ffcc00;
        }
        
        .info {
            font-size: 12px;
            color: #aaa;
        }
        
        .download-btn {
            background: #2e7d32;
            border: none;
            color: white;
            padding: 6px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        
        .download-btn:hover {
            background: #388e3c;
        }
        
        #pages-container {
            margin-top: 60px;
            padding: 20px;
            text-align: center;
        }
        
        .page-wrapper {
            position: relative;
            margin-bottom: 20px;
            background: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: inline-block;
            overflow: hidden;
        }
        
        .page-wrapper canvas {
            display: block;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }
        
        /*  UNA SOLA MARCA DE AGUA CENTRADA */
        .watermark-layer {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) ;
            width: 300px;
            height: 300px;
            pointer-events: none;
            z-index: 10;
            opacity: 0.15;
            background-image: url('${watermarkBase64 || ''}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }
        
        /* Marca de agua con texto (UNA SOLA centrada) */
        .watermark-text-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            pointer-events: none;
            z-index: 11;
            opacity: 0.08;
            font-size: 64px;
            font-weight: bold;
            color: #000;
            font-family: Arial, sans-serif;
            white-space: nowrap;
            text-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .loading {
            text-align: center;
            padding: 50px;
            color: white;
            font-size: 18px;
        }
        
        .textLayer {
            display: none !important;
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <div class="watermark-text">
             UPTAIET - Documento protegido
        </div>
        <div class="zoom-controls">
            <button id="zoom-out">−</button>
            <span id="zoom-level">100%</span>
            <button id="zoom-in">+</button>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
            <button class="download-btn" onclick="downloadPDF()">⬇ Descargar</button>
            <div class="info">No se permite copiar texto | Scroll para navegar</div>
        </div>
    </div>
    
    <div id="pages-container" class="pages-container">
        <div class="loading">Cargando documento... <span id="progress">0</span>%</div>
    </div>

    <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        
        let pdfDoc = null;
        let currentZoom = 1.0;
        const url = '${pdfUrl}';
        const container = document.getElementById('pages-container');
        const watermarkBase64 = '${watermarkBase64 || ''}';
        
        function downloadPDF() {
            fetch('/api/download/tesis/${id}/download-image')
                .then(response => response.blob())
                .then(blob => {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = '${fileName}';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href);
                })
                .catch(error => {
                    console.error('Error al descargar:', error);
                    alert('Error al descargar el documento');
                });
        }
        
        // Deshabilitar atajos y clic derecho
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const key = e.key.toLowerCase();
                if (key === 'c' || key === 'v' || key === 'p' || key === 's' || key === 'u') {
                    e.preventDefault();
                    alert('Este documento está protegido. No se permite copiar el contenido.');
                    return false;
                }
            }
        });
        
        // Cargar el PDF
        pdfjsLib.getDocument(url).promise.then(function(pdf) {
            pdfDoc = pdf;
            renderAllPages();
        }).catch(function(error) {
            console.error('Error:', error);
            container.innerHTML = '<div class="loading">Error al cargar el documento. <a href="${pdfUrl}" style="color:#ffcc00">Haz clic aquí para verlo directamente</a></div>';
        });
        
        async function renderAllPages() {
            container.innerHTML = '';
            const totalPages = pdfDoc.numPages;
            
            for (let i = 1; i <= totalPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: currentZoom });
                
                const pageWrapper = document.createElement('div');
                pageWrapper.className = 'page-wrapper';
                pageWrapper.style.margin = '20px auto';
                pageWrapper.style.width = viewport.width + 'px';
                pageWrapper.style.position = 'relative';
                
                const canvas = document.createElement('canvas');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                const context = canvas.getContext('2d');
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;
                
                pageWrapper.appendChild(canvas);
                
                //  Agregar UNA SOLA marca de agua centrada si existe
                if (watermarkBase64) {
                    const watermarkDiv = document.createElement('div');
                    watermarkDiv.className = 'watermark-layer';
                    pageWrapper.appendChild(watermarkDiv);
                }
                
                //  Agregar UNA SOLA marca de agua con texto centrada
                const textOverlay = document.createElement('div');
                textOverlay.className = 'watermark-text-overlay';
                
                container.appendChild(pageWrapper);
            }
        }
        
        async function reRenderAllPages() {
            if (!pdfDoc) return;
            container.innerHTML = '<div class="loading">Reorganizando páginas...</div>';
            await renderAllPages();
        }
        
        document.getElementById('zoom-in').addEventListener('click', function() {
            currentZoom = Math.min(currentZoom + 0.25, 2.5);
            document.getElementById('zoom-level').textContent = Math.round(currentZoom * 100) + '%';
            reRenderAllPages();
        });
        
        document.getElementById('zoom-out').addEventListener('click', function() {
            currentZoom = Math.max(currentZoom - 0.25, 0.5);
            document.getElementById('zoom-level').textContent = Math.round(currentZoom * 100) + '%';
            reRenderAllPages();
        });
    </script>
</body>
</html>
        `;

            res.setHeader('Content-Type', 'text/html');
            res.send(html);

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al cargar el documento' });
        }
    },

    tesisDownload:async (req, res) => {
    const { id } = req.params;

    try {
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

        // Leer la imagen de marca de agua
        const watermarkPath = path.join(__dirname, '../assets/watermark.png');
        let watermarkImageBytes = null;
        
        if (fs.existsSync(watermarkPath)) {
            watermarkImageBytes = fs.readFileSync(watermarkPath);
        }

        // Leer el PDF original
        const pdfBytes = fs.readFileSync(filePath);
        
        // Cargar el PDF con pdf-lib
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Si hay imagen de marca de agua, incrustarla
        let watermarkImage = null;
        if (watermarkImageBytes) {
            try {
                watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);
            } catch (error) {
                console.warn('No se pudo incrustar la imagen PNG:', error);
            }
        }
        
        const pages = pdfDoc.getPages();
        
        pages.forEach((page) => {
            const { width, height } = page.getSize();
            
            if (watermarkImage) {
                // Dibujar imagen de marca de agua
                const imageWidth = 300;  // Ancho de la marca de agua
                const imageHeight = 300;

                // Calcular posición para centrar
                const x = (width - imageWidth) / 2;
                const y = (height - imageHeight) / 2;
                
                // Dibujar UNA SOLA imagen centrada
                page.drawImage(watermarkImage, {
                    x: x,
                    y: y,
                    width: imageWidth,
                    height: imageHeight,
                    opacity: 0.15, // Opacidad suave
                });
                
            } else {
                // Texto alternativo si no hay imagen
                const fontSize = 60;
                const text = 'UPTAIET';
                page.drawText(text, {
                    x: (width - text.length * fontSize * 0.6) / 2,
                    y: (height - fontSize) / 2,
                    size: fontSize,
                    color: rgb(0.8, 0.8, 0.8),
                    opacity: 0.2,
                    rotate: degrees(-45),
                });
            }
        });
        
        const pdfBytesWithWatermark = await pdfDoc.save();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filePath)}`);
        res.send(Buffer.from(pdfBytesWithWatermark));

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al descargar el documento' });
    }
}
}