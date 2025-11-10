import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Button } from '../../Components/Common/Button';
import { Input } from '../../Components/Common/Input';
import { Alert } from '../../Components/Common/Alert';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

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
            Sistema de Asistencias
          </h1>
          <p className="text-gray-600">
            Oficina de Tecnologías de la Información
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Iniciar Sesión
          </h2>

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

            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Ingresar
            </Button>
          </form>

          {/* Información de ayuda */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              👤 Admin: adrian.valer@municipalidad.gob.pe / admin123    <br />
        👤 Staff: gianfranco.tejada@municipalidad.gob.pe / staff123<br />
        👤 Practicante: manuel.cuchuyrumi@gmail.com / intern123<br />
        👤 Practicante: alex.leon@gmail.com / intern123<br />
        👤 Practicante: carlos.mamani@gmail.com / intern123<br />
        👤 Practicante: elizabeth.lavilla@gmail.com / intern123<br />
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

export default Login;
