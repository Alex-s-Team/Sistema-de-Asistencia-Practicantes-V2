// ============================================================================
// resources/js/components/Layout.jsx - LAYOUT PRINCIPAL
// ============================================================================
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-blue-600">
                Sistema Asistencias
              </Link>
              <div className="hidden md:flex space-x-4">
                <NavLink to="/">Dashboard</NavLink>
                <NavLink to="/practicantes">Practicantes</NavLink>
                <NavLink to="/asistencias">Asistencias</NavLink>
                <NavLink to="/reportes">Reportes</NavLink>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.nombre_completo || user?.nombres}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
  >
    {children}
  </Link>
);

export default Layout;