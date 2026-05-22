import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // Opcional: roles permitidos
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar roles si se especificaron
  if (roles && user && !roles.includes(user.rol)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Acceso denegado</h2>
        <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        <Link to="/" className="mt-4 text-cyan-500 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}