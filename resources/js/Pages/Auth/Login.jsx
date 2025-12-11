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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3484A5]/10 via-[#2CA792]/10 to-white px-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#3484A5]/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2CA792]/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#F0C84F]/5 rounded-full"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo y Título con animación */}
        <div className="text-center mb-8 transform transition-all duration-500 hover:scale-105">
          <div className="mx-auto w-32 h-32 mb-4 bg-white rounded-2xl shadow-lg p-4 transform transition-all duration-300 hover:shadow-xl">
            <img 
              src="/assets/logo.png" 
              alt="Municipalidad de San Jerónimo" 
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-[#3484A5] to-[#2CA792] bg-clip-text text-transparent">
            Sistema de Asistencias
          </h1>
          <p className="text-gray-600 font-medium">
            Oficina de Tecnologías de la Información
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 transform transition-all duration-500 hover:shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#3484A5] to-[#2CA792] rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Iniciar Sesión
            </h2>
          </div>

          {error && (
            <Alert 
              type="error" 
              message={error} 
              onClose={() => setError('')} 
              className="mb-4 animate-fade-in"
            />
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
              className="transform transition-all duration-300 focus:scale-[1.02]"
              icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
            />

            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="transform transition-all duration-300 focus:scale-[1.02]"
              icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 bg-gradient-to-r from-[#3484A5] to-[#2CA792] hover:from-[#2CA792] hover:to-[#3484A5] transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Ingresando...
                </div>
              ) : (
                'Ingresar al Sistema'
              )}
            </Button>
          </form>

          {/* Información de ayuda mejorada */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#F0C84F]/10 to-[#2CA792]/10 rounded-xl border border-[#F0C84F]/20">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-[#F0C84F] rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">Credenciales de Prueba</p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>👤 Admin:</span>
                <span className="font-mono">40956781 / admin123</span>
              </div>
              <div className="flex justify-between">
                <span>👤 Staff-1:</span>
                <span className="font-mono">73980928 / staff123</span>
              </div>
              <div className="flex justify-between">
                <span>👤 Practicante-1:</span>
                <span className="font-mono">76412311 / intern123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="mt-8 text-center text-sm text-gray-600 backdrop-blur-sm bg-white/50 rounded-xl p-4">
          <p className="font-semibold">Municipalidad de San Jerónimo - Cusco</p>
          <p className="mt-1 text-xs">© 2025 - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default Login;