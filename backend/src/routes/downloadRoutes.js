// // backend/src/routes/downloadRoutes.js
// import express from 'express';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import { pool } from '../config/db.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const router = express.Router();

// router.get('/tesis/:id', async (req, res) => {
//     const { id } = req.params;

//     try {
//         const result = await pool.query(
//             'SELECT url_documento FROM tesis.tesis WHERE id_tesis = $1 AND fecha_eliminacion IS NULL',
//             [id]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'Tesis no encontrada' });
//         }

//         const filePath = path.join(__dirname, '../../', result.rows[0].url_documento);

//         if (!fs.existsSync(filePath)) {
//             return res.status(404).json({ error: 'Archivo no encontrado' });
//         }

//         const pdfUrl = `/uploads/${path.basename(path.dirname(filePath))}/${path.basename(filePath)}`;

//         const html = `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Visualizador de Documentos - UPTAIET</title>
//     <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
//     <style>
//         * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//             user-select: none !important;
//             -webkit-user-select: none !important;
//         }
        
//         body {
//             background: #525659;
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//         }
        
//         /* Toolbar fijo en la parte superior */
//         .toolbar {
//             position: fixed;
//             top: 0;
//             left: 0;
//             right: 0;
//             background: #323639;
//             color: white;
//             padding: 10px 20px;
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             flex-wrap: wrap;
//             gap: 10px;
//             z-index: 1000;
//             border-bottom: 1px solid #4a4e52;
//             box-shadow: 0 2px 5px rgba(0,0,0,0.2);
//         }
        
//         .zoom-controls {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//         }
        
//         .zoom-controls button {
//             background: #4a4e52;
//             border: none;
//             color: white;
//             width: 32px;
//             height: 32px;
//             border-radius: 5px;
//             cursor: pointer;
//             font-size: 16px;
//         }
        
//         .zoom-controls button:hover {
//             background: #5a5e62;
//         }
        
//         .zoom-controls span {
//             font-size: 14px;
//             min-width: 50px;
//             text-align: center;
//         }
        
//         .watermark {
//             font-size: 12px;
//             color: #ffcc00;
//         }
        
//         .info {
//             font-size: 12px;
//             color: #aaa;
//         }
        
//         /* Contenedor para todas las páginas (scroll continuo) */
//         #pages-container {
//             margin-top: 60px;
//             padding: 20px;
//             text-align: center;
//         }
        
//         .page-wrapper {
//             margin-bottom: 20px;
//             background: white;
//             border-radius: 4px;
//             box-shadow: 0 2px 10px rgba(0,0,0,0.3);
//             display: inline-block;
//         }
        
//         canvas {
//             display: block;
//             margin: 0 auto;
//         }
        
//         .loading {
//             text-align: center;
//             padding: 50px;
//             color: white;
//             font-size: 18px;
//         }
        
//         /* Ocultar capa de texto de PDF.js */
//         .textLayer {
//             display: none !important;
//         }
//     </style>
// </head>
// <body>
//     <div class="toolbar">
//         <div class="watermark">
//             UPTAIET - Documento protegido
//         </div>
//         <div class="zoom-controls">
//             <button id="zoom-out">−</button>
//             <span id="zoom-level">100%</span>
//             <button id="zoom-in">+</button>
//         </div>
//         <div class="info">
//              No se permite copiar texto | Scroll para navegar
//         </div>
//     </div>
    
//     <div id="pages-container" class="pages-container">
//         <div class="loading">Cargando documento... <span id="progress">0</span>%</div>
//     </div>

//     <script>
//         pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        
//         let pdfDoc = null;
//         let currentZoom = 1.0;
//         const url = '${pdfUrl}';
//         const container = document.getElementById('pages-container');
        
//         // Deshabilitar atajos y clic derecho
//         document.addEventListener('contextmenu', (e) => {
//             e.preventDefault();
//             return false;
//         });
        
//         document.addEventListener('keydown', (e) => {
//             if (e.ctrlKey || e.metaKey) {
//                 const key = e.key.toLowerCase();
//                 if (key === 'c' || key === 'v' || key === 'p' || key === 's' || key === 'u') {
//                     e.preventDefault();
//                     alert('Este documento está protegido. No se permite copiar el contenido.');
//                     return false;
//                 }
//             }
//         });
        
//         // Cargar el PDF
//         pdfjsLib.getDocument(url).promise.then(function(pdf) {
//             pdfDoc = pdf;
//             renderAllPages();
//         }).catch(function(error) {
//             console.error('Error:', error);
//             container.innerHTML = '<div class="loading">Error al cargar el documento. <a href="${pdfUrl}" style="color:#ffcc00">Haz clic aquí para verlo directamente</a></div>';
//         });
        
//         async function renderAllPages() {
//             container.innerHTML = '';
//             const totalPages = pdfDoc.numPages;
            
//             for (let i = 1; i <= totalPages; i++) {
//                 const page = await pdfDoc.getPage(i);
//                 const viewport = page.getViewport({ scale: currentZoom });
                
//                 // Crear contenedor para la página
//                 const pageWrapper = document.createElement('div');
//                 pageWrapper.className = 'page-wrapper';
//                 pageWrapper.style.margin = '20px auto';
//                 pageWrapper.style.width = viewport.width + 'px';
                
//                 // Crear canvas
//                 const canvas = document.createElement('canvas');
//                 canvas.height = viewport.height;
//                 canvas.width = viewport.width;
                
//                 const context = canvas.getContext('2d');
                
//                 await page.render({
//                     canvasContext: context,
//                     viewport: viewport,
//                 }).promise;
                
//                 pageWrapper.appendChild(canvas);
//                 container.appendChild(pageWrapper);
//             }
//         }
        
//         async function reRenderAllPages() {
//             if (!pdfDoc) return;
//             container.innerHTML = '<div class="loading">Reorganizando páginas...</div>';
//             await renderAllPages();
//         }
        
//         // Zoom
//         document.getElementById('zoom-in').addEventListener('click', function() {
//             currentZoom = Math.min(currentZoom + 0.25, 2.5);
//             document.getElementById('zoom-level').textContent = Math.round(currentZoom * 100) + '%';
//             reRenderAllPages();
//         });
        
//         document.getElementById('zoom-out').addEventListener('click', function() {
//             currentZoom = Math.max(currentZoom - 0.25, 0.5);
//             document.getElementById('zoom-level').textContent = Math.round(currentZoom * 100) + '%';
//             reRenderAllPages();
//         });
//     </script>
// </body>
// </html>
//         `;

//         res.setHeader('Content-Type', 'text/html');
//         res.send(html);

//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Error al cargar el documento' });
//     }
// });

// export default router;



// backend/src/routes/downloadRoutes.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/tesis/:id', async (req, res) => {
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
        
        /* Toolbar fijo en la parte superior */
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
        
        .watermark {
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
        
        /* Contenedor para todas las páginas (scroll continuo) */
        #pages-container {
            margin-top: 60px;
            padding: 20px;
            text-align: center;
        }
        
        .page-wrapper {
            margin-bottom: 20px;
            background: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: inline-block;
        }
        
        canvas {
            display: block;
            margin: 0 auto;
        }
        
        .loading {
            text-align: center;
            padding: 50px;
            color: white;
            font-size: 18px;
        }
        
        /* Ocultar capa de texto de PDF.js */
        .textLayer {
            display: none !important;
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <div class="watermark">
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
        
        // Función para descargar el PDF
        function downloadPDF() {
            const link = document.createElement('a');
            link.href = url;
            link.download = '${fileName}';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
                
                // Crear contenedor para la página
                const pageWrapper = document.createElement('div');
                pageWrapper.className = 'page-wrapper';
                pageWrapper.style.margin = '20px auto';
                pageWrapper.style.width = viewport.width + 'px';
                
                // Crear canvas
                const canvas = document.createElement('canvas');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                const context = canvas.getContext('2d');
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;
                
                pageWrapper.appendChild(canvas);
                container.appendChild(pageWrapper);
            }
        }
        
        async function reRenderAllPages() {
            if (!pdfDoc) return;
            container.innerHTML = '<div class="loading">Reorganizando páginas...</div>';
            await renderAllPages();
        }
        
        // Zoom
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
});

export default router;