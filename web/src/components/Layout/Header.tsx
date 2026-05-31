import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Shield, User, Menu, X, Home, BookOpen, Library, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo_uptaiet.png';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [window.location.pathname]);

  const isAdmin = user?.id_rol === 3; // Administrador

  return (
    <header className="bg-cyan-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <img src={logo} alt="Logo de UPTAIET" className="h-8 w-8 object-contain" />
            <span className="text-lg md:text-xl font-bold text-white">UPTAIET</span>
            <span className="hidden sm:inline text-sm text-gray-100">Catálogo Digital</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-yellow-500 transition">
              Inicio
            </Link>
            <Link to="/proyecto" className="hover:text-yellow-500 transition">
              Proyectos
            </Link>
            <Link to="/libros" className="hover:text-yellow-500 transition">
              Libros
            </Link>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg transition"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to={'/perfil'}>
                <span className="text-sm text-gray-100">{user?.nombre}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-300 hover:text-red-200 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 hover:text-yellow-500 transition">
                <User className="h-4 w-4" />
                <span>Ingresar</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-cyan-700 transition"
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div 
            ref={menuRef}
             className="md:hidden mt-4 pt-4 border-t border-cyan-500 space-y-2 transition-all duration-200 ease-out"
          >
            <Link 
              to="/" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyan-700 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>Inicio</span>
            </Link>
            
            <Link 
              to="/proyecto" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyan-700 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5" />
              <span>Proyectos</span>
            </Link>
            
            <Link 
              to="/libros" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyan-700 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Library className="h-5 w-5" />
              <span>Libros</span>
            </Link>

            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Panel Admin</span>
              </Link>
            )}
            
            <div className="pt-2 border-t border-cyan-500">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-200">
                    <User className="h-4 w-4 inline mr-2" />
                    {user?.nombre}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-300 hover:bg-cyan-700 transition"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyan-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Iniciar Sesión</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};