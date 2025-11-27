import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Button } from '../../Components/Common/Button';
import { Input } from '../../Components/Common/Input';
import { Alert } from '../../Components/Common/Alert';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (dni.length !== 8 || !/^\d+$/.test(dni)) {
      setError('El DNI debe tener exactamente 8 dígitos');
      return;
    }

    setLoading(true);

    try {
      await login(dni, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mixed px-4 animate-fade-in">
      <div className="max-w-md w-full animate-slide-up">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-32 h-32 mb-4 transform hover:scale-110 transition-transform duration-300">
            <img
              src="/assets/logo.png"
              alt="Municipalidad de San Jerónimo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Asistencias
          </h1>
          <p className="text-gray-600">
            Oficina de Tecnologías de la Información
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-lg shadow-xl p-8 backdrop-blur-lg bg-opacity-95">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} className="mb-4 animate-slide-up" />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="DNI"
              placeholder="76412311"
              value={dni}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                setDni(value);
              }}
              required
              autoFocus
              maxLength={8}
              pattern="[0-9]{8}"
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              }
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar'}
            </Button>
          </form>

          {/* Información de ayuda */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold">Cuentas de prueba:</span><br />
              👤 Admin: 40956781 / admin123<br />
              👤 Staff-1: 73980928 / staff123<br />
              👤 Staff-2: 70576281 / staff123<br />
              👤 Practicante-1: 76412311 / intern123<br />
              👤 Practicante-2: 78016752 / intern123<br />
              👤 Practicante-3: 75178979 / intern123<br />
              👤 Practicante-4: 72306843 / intern123<br />
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="flex items-center justify-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Municipalidad de San Jerónimo - Cusco
          </p>
          <p className="mt-1">© 2025 - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
