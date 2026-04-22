import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Configuración de cors
app.use(cors({
    origin: '*',  // Permite conexiones desde cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuración específica para desarrollo (MÁS SEGURA)
// const allowedOrigins = [
//     'http://localhost:8081',  // Expo Metro (común)
//     'http://localhost:19000',  // Expo otro puerto
//     'http://localhost:19001',  // Expo otro puerto
//     'http://10.0.2.2:8081',   // Android emulator
//     'exp://192.168.x.x:8081', // Tu IP local (ajústala)
// ];

// app.use(cors({
//     origin: function(origin, callback) {
//         // Permitir solicitudes sin origen (como Postman)
//         if (!origin) return callback(null, true);
        
//         if (allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             console.log('Origen bloqueado por CORS:', origin);
//             callback(null, true); // En desarrollo, permitir todos
//         }
//     },
//     credentials: true,
// }));

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Importar rutas
import carreraRoutes from './src/routes/carreraRoutes.js';
import tesisRoutes from './src/routes/tesisRoutes.js';

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/carreras', carreraRoutes);
app.use('/api/tesis', tesisRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(` Servidor en http://192.168.0.106:${port}`);
  console.log(` API de Catálogo Universitario`);
});