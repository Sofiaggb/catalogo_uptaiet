import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock} from 'lucide-react';
import { authApi } from '../../api/endpoints/auth';
import logo from '../../assets/logo_uptaiet.png';
import { showErrorAlert } from '../../helpers/alerts';

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { nombre: '', email: '', password: '', confirmPassword: '' };

    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre de usuario es obligatorio';
      isValid = false;
    } else if (form.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = 'El email es obligatorio';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await authApi.enviarCodigo({ email: form.email, nombre: form.nombre });

    if (result.success) {
      navigate(`/verify?email=${encodeURIComponent(form.email)}&nombre=${encodeURIComponent(form.nombre)}&password=${encodeURIComponent(form.password)}`);
    } else {
      showErrorAlert(result.message || 'No se pudo enviar el código');
    }
    setLoading(false);
  };

  return (
    <div className=" bg-white flex flex-col">

      <div className="flex-1 flex items-center justify-center p16">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-6">
             <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500 rounded-full">
              <img src={logo} alt="Logo de UPTAIET" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-black mt-4">Crear Cuenta</h1>
            <p className="text-gray-500 text-sm">Regístrate para acceder</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre de usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={form.nombre}
                  onChange={(e) => {
                    setForm({ ...form, nombre: e.target.value });
                    setErrors({ ...errors, nombre: '' });
                  }}
                  placeholder="usuario123"
                />
              </div>
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Botón Registrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Cargando...</span>
                </div>
              ) : (
                'Registrarse'
              )}
            </button>

            {/* Link a login */}
            <div className="text-center">
              <span className="text-gray-600">¿Ya tienes cuenta? </span>
              <Link to="/login" className="text-blue-500 font-semibold hover:underline">
                Iniciar Sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}