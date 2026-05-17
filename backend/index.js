import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// También puedes servir la carpeta específica de tesis
app.use('/uploads/tesis', express.static(path.join(__dirname, 'uploads/tesis')));

console.log('Sirviendo archivos desde:', path.join(__dirname, '../uploads'));
console.log('Ruta de uploads:', path.join(__dirname, '../uploads/tesis'));

// Importar rutas
import carreraRoutes from './src/routes/carreraRoutes.js';
import tesisRoutes from './src/routes/tesisRoutes.js';
import materiaRoutes from './src/routes/materiaRoutes.js';
import docsRoutes from './src/routes/libroRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

// Middlewares
// Configuración de cors
app.use(cors({
    origin: '*',  // Permite conexiones desde cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// Logging de todas las peticiones (muestra método, ruta, status, tiempo)
app.use(morgan('dev'));  // 'dev' muestra: POST /api/tesis 200 15ms - 200b

// Rutas
app.use('/api/carreras', carreraRoutes);
app.use('/api/tesis', tesisRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/libros', docsRoutes);
app.use('/api/auth', authRoutes);


// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(` Servidor en http://192.168.0.106:${port}`);
  console.log(` API de Catálogo Universitario`);
});