import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, ArrowLeft,  Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/endpoints/auth';
import { showErrorAlert, showSuccessAlert, showWarningAlert } from '../../helpers/alerts';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = async () => {
    if (!email.trim()) {
      showWarningAlert('Ingresa tu email');
      return;
    }

    setLoading(true);
    const result = await authApi.enviarCodigoRecuperacion({ email });
    
    if (result.success) {
      setStep(2);
      showSuccessAlert('Se ha enviado un código de verificación a tu correo');
    } else {
      showErrorAlert(result.message || 'No se pudo enviar el código');
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!codigo || codigo.length !== 6) {
      showWarningAlert('Ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    const result = await authApi.verificarCodigoRecuperacion({ email, codigo });
    
    if (result.success) {
      setStep(3);
    } else {
      showErrorAlert(result.message || 'Código incorrecto');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!nuevaPassword || nuevaPassword.length < 6) {
      showWarningAlert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (nuevaPassword !== confirmPassword) {
      showWarningAlert('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const result = await authApi.cambiarContrasena({ 
      email, 
      codigo, 
      nueva_contrasena: nuevaPassword 
    });
    
    if (result.success) {
      showSuccessAlert('Contraseña actualizada correctamente', () =>  navigate('/login'));
     
    } else {
      showErrorAlert(result.message || 'No se pudo cambiar la contraseña');
    }
    setLoading(false);
  };

  return (
    <div className=" bg-white flex flex-col">
      {/* Header */}
      <div className="pt-8 pb-4 px-5">
        <Link to="/login" className="inline-flex items-center text-cyan-500 hover:text-cyan-600">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver al login
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Icono */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500 rounded-full">
              <Key className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black mt-4">
              {step === 1 && 'Recuperar contraseña'}
              {step === 2 && 'Verificar código'}
              {step === 3 && 'Nueva contraseña'}
            </h1>
            <p className="text-gray-500 mt-2">
              {step === 1 && 'Ingresa tu email para recibir un código de verificación'}
              {step === 2 && 'Ingresa el código que enviamos a tu correo'}
              {step === 3 && 'Ingresa tu nueva contraseña'}
            </p>
          </div>

          {/* Paso 1: Email */}
          {step === 1 && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  'Enviar código'
                )}
              </button>
            </>
          )}

          {/* Paso 2: Código */}
          {step === 2 && (
            <>
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
              <button
                onClick={handleVerifyCode}
                disabled={loading}
                className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verificando...</span>
                  </div>
                ) : (
                  'Verificar código'
                )}
              </button>
              
              <button
                onClick={handleSendCode}
                className="w-full text-center text-blue-500 mt-4 hover:underline"
              >
                Reenviar código
              </button>
            </>
          )}

          {/* Paso 3: Nueva contraseña */}
          {step === 3 && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
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
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                  />
                </div>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Cambiando...</span>
                  </div>
                ) : (
                  'Cambiar contraseña'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}