import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Layout/Header';
import { Home } from './pages/Home';
import { TesisList } from './pages/Tesis/TesisList';
import { Login } from './pages/Auth/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TesisCreate } from './pages/Tesis/TesisCreate';
import { TesisEdit } from './pages/Tesis/TesisEdit';
import { TesisDetail } from './pages/Tesis/TesisDetail';
import { CarrerasCreate } from './pages/Carreras/Carreracreate';
import { CarrerasList } from './pages/Carreras/CarreraList';
import { CarreraDetail } from './pages/Carreras/CarreraDetail';
import { CarrerasEdit } from './pages/Carreras/Carreraedit';
import { MateriasCreate } from './pages/Materias/MateriaCreate';
import { MateriasList } from './pages/Materias/MateriaList';
import { MateriasEdit } from './pages/Materias/MateriaEdit';
import { LibrosList } from './pages/Libros/LibroList';
import { LibroDetail } from './pages/Libros/Librodetail';
import { LibrosCreate } from './pages/Libros/LibroCreate';
import { LibrosEdit } from './pages/Libros/LibroEdit';
import { Register } from './pages/Auth/Register';
import { Verify } from './pages/Auth/Verify';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { PerfilDetail } from './pages/Perfil/PerfilDetail';
import { SolicitudesRol } from './pages/Admin/SolicitudesRol';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { Auditoria } from './pages/Admin/Auditoria';
import { Estadisticas } from './pages/Admin/Estadisticas';
import { Footer } from './components/Layout/Footer';
import { GestionEncabezado } from './pages/Admin/GestionEncabezado';
import { GestionTipoCarrera } from './pages/Admin/GestionTipoCarrera';
import { Permisos } from './pages/Admin/Permisos';
import { Toaster } from 'react-hot-toast';
import { useEffect, useRef } from 'react';

// Componente que refresca el usuario al cambiar de ruta
const REFRESH_COOLDOWN = 60 * 1000; // 1 minuto

function UserRefresher() {
  const location = useLocation();
  const { refreshUser, isAuthenticated, user } = useAuth();
  const lastRefreshRef = useRef(0); // Guarda el timestamp del último refresh

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const ahora = Date.now();
    const tiempoDesdeUltimoRefresh = ahora - lastRefreshRef.current;

    // Solo refrescar si pasó el tiempo mínimo desde el último refresh
    if (tiempoDesdeUltimoRefresh > REFRESH_COOLDOWN) {
      refreshUser();
      lastRefreshRef.current = ahora; // Actualizar el timestamp
    }
  }, [location.pathname, isAuthenticated, user?.id_usuario]);

  return null;
}

function App() {

  return (
    <AuthProvider>
      <Router>
        <UserRefresher />
        <div className="min-h-screen bg-white">
          <Header />

          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={[3]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route path="solicitudes" element={<SolicitudesRol />} />
              <Route path="auditoria" element={<Auditoria />} />
              <Route path="permisos" element={<Permisos />} />
              <Route path="estadisticas" element={<Estadisticas />} />
              <Route path="encabezado" element={<GestionEncabezado />} />
              <Route path="configuracionCarreras" element={<GestionTipoCarrera />} />
            </Route>

          </Routes>
          <main className="container mx-auto ">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Rutas protegidas (requieren autenticación) */}
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <PerfilDetail />
                  </ProtectedRoute>
                }
              />

              {/* proyecots  */}
              <Route path="/proyecto" element={<TesisList />} />
              <Route path="/proyecto/:id" element={<TesisDetail />} />
              <Route path="/proyecto/create" element={
                <ProtectedRoute roles={[3, 4]}>
                  <TesisCreate />
                </ProtectedRoute>
              } />

              <Route path="/proyecto/edit/:id" element={
                <ProtectedRoute roles={[3, 4]}>
                  <TesisEdit />
                </ProtectedRoute>
              } />

              {/* carreras  */}
              <Route path="/carreras" element={<CarrerasList />} />
              <Route path="/carreras/:id" element={<CarreraDetail />} />
              <Route path="/carreras/create" element={
                <ProtectedRoute roles={[3, 4]}>
                  <CarrerasCreate />
                </ProtectedRoute>
              } />
              <Route path="/carreras/edit/:id" element={
                <ProtectedRoute roles={[3, 4]}>
                  <CarrerasEdit />
                </ProtectedRoute>
              } />
              {/* materias  */}
              <Route path="/materias" element={<MateriasList />} />
              <Route path="/materias/create" element={
                <ProtectedRoute roles={[3, 4]}>
                  <MateriasCreate />
                </ProtectedRoute>
              } />
              <Route path="/materias/edit/:id" element={
                <ProtectedRoute roles={[3, 4]}>
                  <MateriasEdit />
                </ProtectedRoute>
              } />

              {/* Libros  */}
              <Route path="/libros" element={<LibrosList />} />
              <Route path="/libros/:id" element={<LibroDetail />} />
              <Route path="/libros/create" element={
                <ProtectedRoute roles={[2, 3, 4]}>
                  <LibrosCreate />
                </ProtectedRoute>
              } />
              <Route path="/libros/edit/:id" element={
                <ProtectedRoute roles={[2, 3, 4]}>
                  <LibrosEdit />
                </ProtectedRoute>
              } />

            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000, // Duración en ms del mensaje
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;