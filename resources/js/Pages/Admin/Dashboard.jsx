import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { attendanceService } from '../../Services/attendanceService';
import { taskService } from '../../Services/taskService';
import { userService } from '../../Services/userService';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Badge } from '../../Components/Common/Badge';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Alert } from '../../Components/Common/Alert';
import {
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../Utils/helpers';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalInterns: 0,
    activeInterns: 0,
    pendingAttendances: 0,
    pendingJustifications: 0,
    todayAttendances: 0,
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  });
  const [tasks, setTasks] = useState({
    pending: [],
    in_progress: [],
    completed: [],
  });
  const [recentData, setRecentData] = useState({
    interns: [],
    pendingAttendances: [],
    tasks: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Las respuestas ya son arrays directamente
      const [internsData, pendingData, tasksData] = await Promise.all([
        userService.getInterns(),
        attendanceService.getPending(),
        taskService.getTasks(),
      ]);

      console.log('Dashboard data:', {
        interns: internsData,
        pending: pendingData,
        tasks: tasksData
      });

      // Procesar datos de tareas - Usando la misma estructura que en MyTasks
      let tasksList = {
        pending: [],
        in_progress: [],
        completed: [],
      };
      
      if (Array.isArray(tasksData)) {
        // Si viene como array, lo agrupamos por estado
        tasksList.pending = tasksData.filter(t => t.status === 'pending');
        tasksList.in_progress = tasksData.filter(t => t.status === 'in_progress');
        tasksList.completed = tasksData.filter(t => t.status === 'completed');
      } else if (tasksData && typeof tasksData === 'object') {
        // Si ya viene agrupado por estado
        tasksList = {
          pending: tasksData.pending || [],
          in_progress: tasksData.in_progress || [],
          completed: tasksData.completed || [],
        };
      }
      
      setTasks(tasksList);
      
      // Combinar tareas para recientes
      const allTasks = [...tasksList.pending, ...tasksList.in_progress, ...tasksList.completed];
      
      // Calcular stats
      const interns = Array.isArray(internsData) ? internsData : [];
      const pending = Array.isArray(pendingData) ? pendingData : [];
      
      setStats({
        totalInterns: interns.length,
        activeInterns: interns.filter(i => i.is_active).length,
        pendingAttendances: pending.length,
        pendingJustifications: 0, // TODO: implementar cuando tengamos el endpoint
        todayAttendances: 0, // TODO: implementar
        totalTasks: allTasks.length,
        pendingTasks: tasksList.pending.length,
        inProgressTasks: tasksList.in_progress.length,
        completedTasks: tasksList.completed.length,
      });

      // Guardar datos recientes
      setRecentData({
        interns: interns.slice(0, 5),
        pendingAttendances: pending.slice(0, 5),
        tasks: allTasks.slice(0, 5),
      });

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

  // Combinar tareas pendientes y en progreso
  const activeTasks = [...tasks.pending, ...tasks.in_progress];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Panel de Administración
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
              <p className="text-sm text-gray-600 mb-1">Total Practicantes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalInterns}</p>
              <p className="text-xs text-gray-500 mt-1">registrados</p>
            </div>
            <UsersIcon className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        
        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Practicantes Activos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeInterns}</p>
              <p className="text-xs text-gray-500 mt-1">activos hoy</p>
            </div>
            <UsersIcon className="h-12 w-12 text-green-500" />
          </div>
        </Card>

        <Link to="/validate-attendance">
          <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Asistencias Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingAttendances}</p>
                <p className="text-xs text-gray-500 mt-1">por validar</p>
              </div>
              <ClockIcon className="h-12 w-12 text-yellow-500" />
            </div>
          </Card>
        </Link>

        {/* MODIFICACIÓN: Tarjeta de Tareas Activas actualizada */}
        <Link to="/tasks">
          <Card className="bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tareas Activas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingTasks + stats.inProgressTasks}</p>
                <p className="text-xs text-gray-500 mt-1">pendientes y en progreso</p>
              </div>
              <ClipboardDocumentCheckIcon className="h-12 w-12 text-purple-500" />
            </div>
          </Card>
        </Link>
      </div>



      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/validate-attendance">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-primary-50 to-white">
            <div className="text-center p-4">
              <ClockIcon className="h-12 w-12 text-primary-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Validar Asistencias</h3>
              <p className="text-sm text-gray-600">
                {stats.pendingAttendances} pendientes de aprobación
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-secondary-50 to-white">
            <div className="text-center p-4">
              <UsersIcon className="h-12 w-12 text-secondary-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Gestionar Usuarios</h3>
              <p className="text-sm text-gray-600">
                {stats.totalInterns} practicantes registrados
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/tasks">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-white">
            <div className="text-center p-4">
              <ClipboardDocumentCheckIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Gestionar Tareas</h3>
              <p className="text-sm text-gray-600">
                {stats.totalTasks} tareas registradas
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Practicantes Activos */}
      <Card
        title="Practicantes Activos"
        subtitle="Lista de practicantes registrados en el sistema"
        actions={
          <Link to="/users">
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </Link>
        }
      >
        {recentData.interns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UsersIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>No hay practicantes activos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentData.interns.map((intern) => (
              <div
                key={intern.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{intern.name}</h4>
                  <p className="text-sm text-gray-600">{intern.position || 'Practicante'}</p>
                  <p className="text-xs text-gray-500 mt-1">DNI: {intern.dni}</p>
                </div>
                <Badge type="status" value="success">
                  Activo
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pending Attendances */}
      <Card
        title="Asistencias Pendientes de Validación"
        subtitle="Registros que requieren tu aprobación"
        actions={
          <Link to="/validate-attendance">
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </Link>
        }
      >
        {recentData.pendingAttendances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>No hay asistencias pendientes de validación</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentData.pendingAttendances.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {attendance.user?.name || 'Usuario'}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(attendance.date)} - {attendance.entry_time ? 'Entrada' : 'Salida'}
                  </p>
                  {attendance.is_remote_entry && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Registro remoto: {attendance.remote_entry_reason || 'Sin razón especificada'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {attendance.has_delay && (
                    <Badge type="status" value="warning">
                      Retraso
                    </Badge>
                  )}
                  <Badge type="status" value="pending">
                    Pendiente
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Resumen del Sistema">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Usuarios:</span>
              <span className="font-semibold">{stats.totalInterns + 3}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Practicantes Activos:</span>
              <span className="font-semibold text-green-600">{stats.activeInterns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Personal de Oficina:</span>
              <span className="font-semibold">3</span>
            </div>
          </div>
        </Card>

        <Card title="Acciones Rápidas">
          <div className="space-y-2">
            <Link to="/users?action=new">
              <Button variant="outline" size="sm" className="w-full justify-start">
                + Registrar Nuevo Practicante
              </Button>
            </Link>
            <Link to="/tasks?action=new">
              <Button variant="outline" size="sm" className="w-full justify-start">
                + Crear Nueva Tarea
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Ver Reportes
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;