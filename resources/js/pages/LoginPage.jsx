import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth'; // ajusta la ruta según tu estructura
import GalaxyAnimation from '../components/GalaxyAnimation.jsx'; // mismo componente del diseño original

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
       strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(correo, contraseña);
      navigate('/');
    } catch (err) {
      console.error('Error de login:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Fondo animado */}
      <GalaxyAnimation className="absolute inset-0 z-0" density={2.2} glowIntensity={0.6} />

      {/* Contenedor principal */}
      <div className="w-full max-w-4xl mx-auto bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col lg:flex-row relative z-10 border border-slate-700">

        {/* Columna izquierda */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center items-center bg-gradient-to-br from-brand-blue to-brand-teal rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Sistema de Asistencia</h2>
            <p className="text-blue-100">Bienvenido. Por favor, inicie sesión para continuar.</p>
          </div>
        </div>

        {/* Columna derecha (formulario) */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white mb-6"
          >
            <BackArrowIcon />
          </button>

          <h1 className="text-3xl font-bold mb-2 text-slate-100">Login to system</h1>
          <p className="text-slate-400 mb-8">
            Please enter your login information or{' '}
            <a href="#" className="text-brand-yellow hover:underline font-medium">
              click here to registration
            </a>
          </p>

          {/* Mostrar error */}
          {error && (
            <div className="bg-red-500/20 border-l-4 border-red-400 text-red-300 px-4 py-3 rounded mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-slate-300">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  disabled={loading}
                  className="appearance-none block w-full px-3 py-2 bg-slate-700/80 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  required
                  disabled={loading}
                  className="appearance-none block w-full px-3 py-2 bg-slate-700/80 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-yellow focus:ring-brand-yellow border-slate-500 rounded bg-slate-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-slate-900 bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow focus:ring-offset-slate-900 disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Log In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
