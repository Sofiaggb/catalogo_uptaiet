import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* Rutas protegidas (requieren autenticación) */}
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <div>Mi Perfil</div>
                  </ProtectedRoute>
                }
              />
              {/* Rutas solo para administradores */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['administrador']}>
                    <div>Panel de Administración</div>
                  </ProtectedRoute>
                }
              />

              {/* proyecots  */}
              <Route path="/proyecto" element={<TesisList />} />
              <Route path="/proyecto/:id" element={<TesisDetail />} />
              <Route path="/proyecto/create" element={
                <ProtectedRoute>
                  <TesisCreate />
                </ProtectedRoute>
              } />

              <Route path="/proyecto/edit/:id" element={
                <ProtectedRoute>
                  <TesisEdit />
                </ProtectedRoute>
              } />

              {/* carreras  */}
              <Route path="/carreras" element={<CarrerasList />} />
              <Route path="/carreras/:id" element={<CarreraDetail />} />
              <Route path="/carreras/create" element={
                <ProtectedRoute>
                  <CarrerasCreate />
                </ProtectedRoute>
              } />
              <Route path="/carreras/edit/:id" element={
                <ProtectedRoute>
                  <CarrerasEdit />
                </ProtectedRoute>
              } />
              {/* materias  */}
              <Route path="/materias" element={<MateriasList />} />
              <Route path="/materias/create" element={
                <ProtectedRoute>
                  <MateriasCreate />
                </ProtectedRoute>
              } />
              <Route path="/materias/edit/:id" element={
                <ProtectedRoute>
                  <MateriasEdit />
                </ProtectedRoute>
              } />

            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;