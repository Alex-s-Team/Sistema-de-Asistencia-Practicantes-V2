import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { taskService } from '../../Services/taskService';
import { userService } from '../../Services/userService';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Badge } from '../../Components/Common/Badge';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Alert } from '../../Components/Common/Alert';
import {
  ClipboardDocumentListIcon,
  UsersIcon,
  PlusCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../Utils/helpers';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    totalInterns: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [tasksData, internsData] = await Promise.all([
        taskService.getTasks(),
        userService.getInterns(),
      ]);

      console.log('Staff Dashboard data:', {
        tasks: tasksData,
        interns: internsData
      });

      // Las respuestas ya son arrays directamente
      const tasks = Array.isArray(tasksData) ? tasksData : [];
      const interns = Array.isArray(internsData) ? internsData : [];
      
      setStats({
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        totalInterns: interns.length,
      });

      setRecentTasks(tasks.slice(0, 6));
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Error al cargar el dashboard: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Panel de Personal
        </h1>
        <p className="text-primary-50">
          Bienvenido, {user?.name}
        </p>
        <p className="text-sm text-primary-100 mt-1">
          {formatDate(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tareas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
              <p className="text-xs text-gray-500 mt-1">registradas</p>
            </div>
            <ClipboardDocumentListIcon className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingTasks}</p>
              <p className="text-xs text-gray-500 mt-1">por iniciar</p>
            </div>
            <ClipboardDocumentListIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Progreso</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inProgressTasks}</p>
              <p className="text-xs text-gray-500 mt-1">en desarrollo</p>
            </div>
            <ClipboardDocumentListIcon className="h-12 w-12 text-purple-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completadas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedTasks}</p>
              <p className="text-xs text-gray-500 mt-1">finalizadas</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/tasks?action=new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-primary-50 to-white">
            <div className="text-center p-4">
              <PlusCircleIcon className="h-12 w-12 text-primary-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Crear Nueva Tarea</h3>
              <p className="text-sm text-gray-600">
                Asignar tareas a los practicantes
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/tasks">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-secondary-50 to-white">
            <div className="text-center p-4">
              <ClipboardDocumentListIcon className="h-12 w-12 text-secondary-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Gestionar Tareas</h3>
              <p className="text-sm text-gray-600">
                {stats.totalTasks} tareas registradas
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-white">
            <div className="text-center p-4">
              <UsersIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Ver Practicantes</h3>
              <p className="text-sm text-gray-600">
                {stats.totalInterns} practicantes activos
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Tasks */}
      <Card
        title="Tareas Recientes"
        subtitle="Últimas tareas creadas y su estado actual"
        actions={
          <Link to="/tasks">
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </Link>
        }
      >
        {recentTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClipboardDocumentListIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>No hay tareas registradas</p>
            <Link to="/tasks?action=new">
              <Button variant="primary" size="sm" className="mt-4">
                Crear Primera Tarea
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 flex-1">
                    {task.title}
                  </h4>
                  <Badge type="status" value={task.status}>
                    {task.status === 'pending' ? 'Pendiente' : 
                     task.status === 'in_progress' ? 'En Progreso' : 'Completada'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {task.description || 'Sin descripción'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Fecha límite: {formatDate(task.due_date)}</span>
                  <Badge type="priority" value={task.priority}>
                    {task.priority === 'high' ? 'Alta' : 
                     task.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Estadísticas de Tareas">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tasa de Completación:</span>
              <span className="font-semibold text-green-600">
                {stats.totalTasks > 0 
                  ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${stats.totalTasks > 0 
                    ? (stats.completedTasks / stats.totalTasks) * 100
                    : 0}%`
                }}
              />
            </div>
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pendientes:</span>
                <span className="font-medium">{stats.pendingTasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">En Progreso:</span>
                <span className="font-medium">{stats.inProgressTasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completadas:</span>
                <span className="font-medium">{stats.completedTasks}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Acciones Rápidas">
          <div className="space-y-2">
            <Link to="/tasks?action=new">
              <Button variant="outline" size="sm" className="w-full justify-start">
                + Crear Nueva Tarea
              </Button>
            </Link>
            <Link to="/users?action=new">
              <Button variant="outline" size="sm" className="w-full justify-start">
                + Registrar Nuevo Practicante
              </Button>
            </Link>
            <Link to="/tasks?filter=pending">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Ver Tareas Pendientes
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;