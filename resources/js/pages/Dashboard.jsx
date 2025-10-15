// ============================================================================
// resources/js/pages/Dashboard.jsx
// ============================================================================
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { dashboardService } from '../services/dashboard';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getEstadisticas();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">Cargando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchStats}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen de {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Practicantes Activos"
          value={stats?.practicantes_activos || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Asistencias del Mes"
          value={stats?.total_asistencias || 0}
          icon="📋"
          color="green"
        />
        <StatCard
          title="Tardanzas"
          value={stats?.tardanzas || 0}
          icon="⏰"
          color="yellow"
        />
        <StatCard
          title="Faltas"
          value={stats?.faltas || 0}
          icon="❌"
          color="red"
        />
      </div>

      {/* Mensaje de bienvenida */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          ¡Bienvenido al Sistema de Asistencias! 🎉
        </h3>
        <p className="text-blue-800">
          Sistema configurado correctamente. Próximamente se agregarán más funcionalidades.
        </p>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        <span className="text-4xl font-bold">{value}</span>
      </div>
      <h3 className="text-sm font-medium opacity-90">{title}</h3>
    </div>
  );
};

export default Dashboard;