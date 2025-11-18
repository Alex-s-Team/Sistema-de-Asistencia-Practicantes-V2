import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { attendanceService } from '../../Services/attendanceService';
import { taskService } from '../../Services/taskService';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Badge } from '../../Components/Common/Badge';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Alert } from '../../Components/Common/Alert';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '../../Utils/helpers';

const InternDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [tasks, setTasks] = useState({
    pending: [],
    in_progress: [],
    completed: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar estadísticas de asistencia
      const statsData = await attendanceService.getStats();
      setStats(statsData);

      // Cargar asistencia de hoy
      const today = new Date().toISOString().split('T')[0];
      const attendances = await attendanceService.getAttendances({ 
        date: today 
      });
      
      // Las respuestas ya son arrays directamente
      if (Array.isArray(attendances) && attendances.length > 0) {
        setTodayAttendance(attendances[0]);
      }

      // Cargar mis tareas - Usando la misma estructura que en MyTasks
      const tasksData = await taskService.getMyTasks();
      setTasks(tasksData);

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

  const hasMarkedEntry = todayAttendance?.entry_time;
  const hasMarkedExit = todayAttendance?.exit_time;

  // Combinar tareas pendientes y en progreso
  const activeTasks = [...tasks.pending, ...tasks.in_progress];
  const completedTasks = tasks.completed;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-primary-50">
          Hoy es {formatDate(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Marcar Entrada
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {hasMarkedEntry 
                  ? `Entrada registrada a las ${formatTime(todayAttendance.entry_time)}`
                  : 'Aún no has marcado tu entrada de hoy'
                }
              </p>
              <Link to="/mark-attendance">
                <Button 
                  variant={hasMarkedEntry ? "outline" : "primary"} 
                  disabled={hasMarkedEntry}
                >
                  {hasMarkedEntry ? 'Entrada Marcada' : 'Marcar Entrada'}
                </Button>
              </Link>
            </div>
            <ClockIcon className="h-12 w-12 text-primary-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-white border-2 border-secondary-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Marcar Salida
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {hasMarkedExit 
                  ? `Salida registrada a las ${formatTime(todayAttendance.exit_time)}`
                  : hasMarkedEntry 
                    ? 'Marca tu salida al finalizar tu jornada'
                    : 'Primero debes marcar tu entrada'
                }
              </p>
              <Link to="/mark-attendance">
                <Button 
                  variant={hasMarkedExit ? "outline" : "secondary"}
                  disabled={!hasMarkedEntry || hasMarkedExit}
                >
                  {hasMarkedExit ? 'Salida Marcada' : 'Marcar Salida'}
                </Button>
              </Link>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-secondary-500" />
          </div>
        </Card>
      </div>

      {/* Today's Status Alerts */}
      {todayAttendance?.is_remote_entry && (
        <Alert
          type="warning"
          message={`Has registrado asistencia en modo remoto. Motivo: ${todayAttendance.remote_entry_reason || 'No especificado'}. Esperando validación.`}
        />
      )}

      {todayAttendance?.has_delay && (
        <Alert
          type="warning"
          message={`Has registrado un retraso hoy. Tu asistencia está pendiente de aprobación.`}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CalendarIcon className="h-10 w-10 text-primary-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
          <p className="text-sm text-gray-600">Días registrados</p>
        </Card>

        <Card className="text-center">
          <CheckCircleIcon className="h-10 w-10 text-secondary-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats?.approved || 0}</p>
          <p className="text-sm text-gray-600">Asistencias aprobadas</p>
        </Card>

        <Card className="text-center">
          <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats?.pending || 0}</p>
          <p className="text-sm text-gray-600">Pendientes de validación</p>
        </Card>

        <Card className="text-center">
          <div className="h-10 w-10 text-accent-500 mx-auto mb-2 flex items-center justify-center">
            <span className="text-3xl">⚡</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.attendance_rate || 0}%</p>
          <p className="text-sm text-gray-600">Tasa de asistencia</p>
        </Card>
      </div>

      {/* My Tasks - Actualizado para mostrar correctamente las tareas activas */}
      <Card
        title="Mis Tareas Activas"
        subtitle="Tareas asignadas pendientes y en progreso"
        actions={
          <Link to="/my-tasks">
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </Link>
        }
      >
        {activeTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClipboardDocumentListIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>No tienes tareas activas en este momento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.slice(0, 5).map((task) => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Fecha límite: {formatDate(task.due_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge type="priority" value={task.priority}>
                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                  <Badge type="status" value={task.status}>
                    {task.status === 'pending' ? 'Pendiente' : 'En Progreso'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Task Stats Cards - Añadido para mostrar estadísticas de tareas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tareas Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.pending.length}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Progreso</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.in_progress.length}</p>
            </div>
            <PlayIcon className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completadas</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.completed.length}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Additional Info */}
      <Card title="Información Adicional">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Horario de Prácticas</h4>
            <p className="text-sm text-gray-600">
              Entrada: {user?.entry_time ? formatTime(user.entry_time) : 'No especificado'}<br />
              Salida: {user?.exit_time ? formatTime(user.exit_time) : 'No especificado'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Periodo de Prácticas</h4>
            <p className="text-sm text-gray-600">
              Inicio: {user?.start_date ? formatDate(user.start_date) : 'No especificado'}<br />
              Fin estimado: {user?.end_date ? formatDate(user.end_date) : 'No especificado'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InternDashboard;