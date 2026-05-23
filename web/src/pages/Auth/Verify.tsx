import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/endpoints/auth';
import { showErrorAlert, showSuccessAlert, showWarningAlert } from '../../helpers/alerts';

export function Verify() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const nombre = searchParams.get('nombre') || '';
  const password = searchParams.get('password') || '';
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const handleVerify = async () => {
    if (!codigo || codigo.length !== 6) {
      showWarningAlert('Ingresa el código de 6 dígitos');
      return;
    }
    setLoading(true);
    try {

      const result = await authApi.verificarYRegistrar({
        email,
        codigo,
        password,
        nombre,
      });

      console.log(result)

      if (result.success && result.data) {
        await login(email, password);
        showSuccessAlert('Cuenta creada correctamente', () => navigate('/'));

      } else {
        showErrorAlert(result.message || 'Código incorrecto');
      }
    } catch (error) {
      showErrorAlert(error.message || 'Código incorrecto');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setReenviando(true);
    const result = await authApi.reenviarCodigo({ email });

    if (result.success) {
      showSuccessAlert('Se ha enviado un nuevo código a tu correo');
    } else {
      showErrorAlert(result.message || 'No se pudo reenviar el código');
    }
    setReenviando(false);
  };

  return (
    <div className=" bg-white flex flex-col">
      {/* Header */}
      <div className="pt-8 pb-4 px-5">
        <Link to="/register" className="inline-flex items-center text-cyan-500 hover:text-cyan-600">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver al registro
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Icono */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500 rounded-full">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black mt-4">Verifica tu correo</h1>
            <p className="text-gray-500 mt-2">
              Hemos enviado un código de verificación a:
            </p>
            <p className="text-blue-600 font-semibold mt-1">{email}</p>
          </div>

          {/* Input código */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código de verificación
            </label>
            <input
              type="text"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="000000"
            />
          </div>

          {/* Botón Verificar */}
          <button
            type='button'
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Verificando...</span>
              </div>
            ) : (
              'Verificar y Crear Cuenta'
            )}
          </button>

          {/* Reenviar código */}
          <div className="text-center mt-6">
            <span className="text-gray-600">¿No recibiste el código? </span>
            <button
              onClick={handleResend}
              disabled={reenviando}
              className="text-blue-500 font-semibold hover:underline"
            >
              {reenviando ? 'Enviando...' : 'Reenviar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}