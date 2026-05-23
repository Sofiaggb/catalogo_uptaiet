import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import logo from '../../assets/logo_uptaiet.png';
export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-cyan-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="Logo de UPTAIET" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold text-white">UPTAIET</span>
            <span className="text-sm text-gray-100">Catálogo Digital</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link to="/" className="hover:text-yellow-500 transition">
              inicio
            </Link>
            <Link to="/proyecto" className="hover:text-yellow-500 transition">Proyectos</Link>
            <Link to="/libros" className="hover:text-yellow-500 transition">Libros</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">{user?.nombre}</span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 hover:text-yellow-500">
                <User className="h-4 w-4" />
                <span>Ingresar</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};