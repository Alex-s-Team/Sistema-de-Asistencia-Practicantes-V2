import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../Components/Common/Button';
import { Input } from '../../Components/Common/Input';
import { Alert } from '../../Components/Common/Alert';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulación - en producción usaría authService.forgotPassword
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (err) {
      setError('Error al enviar el correo. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-white px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Correo Enviado
            </h2>

            <p className="text-gray-600 mb-6">
              Se ha enviado un correo a <strong>{email}</strong> con las instrucciones
              para restablecer tu contraseña.
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam o
              contacta al administrador del sistema.
            </p>

            <Link to="/login">
              <Button variant="primary" className="w-full">
                Volver al Inicio de Sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-white px-4">
      <div className="max-w-md w-full">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-32 h-32 mb-4">
            <img 
              src="/assets/logo.png" 
              alt="Municipalidad de San Jerónimo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-gray-600">
            Ingresa tu correo electrónico y te enviaremos instrucciones
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />
          )}

          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Enviar Instrucciones
            </Button>
          </form>

          <div className="mt-6">
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Volver al Inicio de Sesión
              </Button>
            </Link>
          </div>

          {/* Información de ayuda */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              Si no tienes acceso a tu correo, contacta al administrador del sistema
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Municipalidad de San Jerónimo - Cusco</p>
          <p className="mt-1">© 2025 - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;