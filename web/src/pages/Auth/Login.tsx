import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowLeft, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!form.email.trim()) {
      newErrors.email = 'El usuario es obligatorio';
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const result = await login(form.email, form.password);

    if (result.success) {
      navigate('/');
    } else {
      alert(result.message || 'Email o contraseña incorrectos');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header con botón volver */}
      <div className="pt-8 pb-4 px-5">
        <Link to="/" className="inline-flex items-center text-cyan-500 hover:text-cyan-600">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500 rounded-full">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black mt-4">UPTAIET</h1>
            <p className="text-gray-500 text-sm">Catálogo Digital</p>
          </div>

          {/* Título */}
          <h2 className="text-3xl font-bold text-black mb-2">Bienvenido</h2>
          <p className="text-gray-500 mb-8">Inicia sesión para continuar</p>

          {/* Formulario */}
          <form onSubmit={handleLogin}>
            {/* Email / Usuario */}
            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                className={`w-full bg-gray-50 border rounded-lg p-3 text-base outline-none transition ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'
                }`}
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setErrors({ ...errors, email: '' });
                }}
                placeholder="correo@ejemplo.com o tu_usuario"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full bg-gray-50 border rounded-lg p-3 text-base outline-none transition pr-10 ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'
                  }`}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setErrors({ ...errors, password: '' });
                  }}
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Botón Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-cyan-400 text-white text-lg font-bold hover:bg-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Cargando...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Olvidé contraseña */}
            <Link
              to="/forgot-password"
              className="block text-center text-blue-500 mt-4 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>

            {/* Link a registro */}
            <div className="text-center mt-6">
              <span className="text-gray-600">¿No tienes cuenta? </span>
              <Link to="/register" className="text-blue-500 font-semibold hover:underline">
                Regístrate
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}