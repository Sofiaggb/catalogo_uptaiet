# Catálogo UPTAIET - Sistema de Gestión de Tesis

Sistema completo para la gestión, visualización y control de proyectos de la UPTAIET (Universidad Politécnica Territorial de la Alta Ingeniería y Tecnología).

## Arquitectura del Proyecto
catalogo_uptaiet/
├── backend/ # API REST con Node.js + Express
├── web/ # Aplicación Web con React + Vite
├── clientApp/ # Aplicación Móvil con React Native


## Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación y autorización
- **Multer** - Manejo de archivos
- **PDF-lib** - Manipulación de PDFs
- **PDF.js** - Visualización de PDFs

### Frontend Web
- **React** - Biblioteca UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

### Mobile
- **React Native** - Framework móvil
- **Expo** - Herramientas para React Native
- **React Navigation** - Navegación
- **Axios** - Cliente HTTP


##  Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn
- Git

### 1. Clonar el repositorio
```bash
git clone git@github.com:Sofiaggb/catalogo_uptaiet.git
cd catalogo_uptaiet
2. Configurar Backend
bash
cd backend
npm install
Crear archivo .env:

env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=tesis_db
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760


npm run dev
# Servidor en: http://localhost:5000
3. Configurar Frontend Web
bash
cd ../clientApp
npm install
Crear archivo .env:

env
VITE_API_URL=http://localhost:5000/api
VITE_API_KEY=tu_api_key
Iniciar aplicación:


npm run dev
# Aplicación en: http://localhost:5173
4. Configurar Mobile
bash
cd ../mobileApp
npm install
Iniciar Expo:

npx expo start
# Escanea el código QR con la app Expo Go