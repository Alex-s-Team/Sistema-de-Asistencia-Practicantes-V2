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
  UserCircleIcon,
  MapPinIcon,
  ChartBarIcon,
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

  // Calcular progreso de tareas
  const totalTasks = activeTasks.length + completedTasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header con Gradiente Mejorado */}
      <div className="gradient-primary rounded-lg p-6 text-white shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-primary-50">
              Hoy es {formatDate(new Date(), 'EEEE, dd MMMM yyyy')}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} className="animate-slide-up" />
      )}

      {/* Quick Actions con Diseño Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
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
                  className="w-full transform hover:scale-105 transition-transform duration-200"
                >
                  {hasMarkedEntry ? 'Entrada Marcada' : 'Marcar Entrada'}
                </Button>
              </Link>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ml-4 ${
              hasMarkedEntry ? 'bg-green-100' : 'bg-primary-100'
            }`}>
              <ClockIcon className={`h-8 w-8 ${
                hasMarkedEntry ? 'text-green-600' : 'text-primary-500'
              }`} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-white border-2 border-secondary-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
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
                  className="w-full transform hover:scale-105 transition-transform duration-200"
                >
                  {hasMarkedExit ? 'Salida Marcada' : 'Marcar Salida'}
                </Button>
              </Link>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ml-4 ${
              hasMarkedExit ? 'bg-green-100' : 'bg-secondary-100'
            }`}>
              <CheckCircleIcon className={`h-8 w-8 ${
                hasMarkedExit ? 'text-green-600' : 'text-secondary-500'
              }`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Status Alerts con Diseño Mejorado */}
      {todayAttendance?.is_remote_entry && (
        <Alert
          type="warning"
          message={`Has registrado asistencia en modo remoto. Motivo: ${todayAttendance.remote_entry_reason || 'No especificado'}. Esperando validación.`}
          className="animate-slide-up border-l-4 border-accent-400"
        />
      )}

      {todayAttendance?.has_delay && (
        <Alert
          type="warning"
          message={`Has registrado un retraso hoy. Tu asistencia está pendiente de aprobación.`}
          className="animate-slide-up border-l-4 border-accent-400"
        />
      )}

      {/* Stats Grid con Diseño Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white border-l-4 border-primary-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Días registrados</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats?.total || 0) * 5, 100)}%` }}
                ></div>
              </div>
            </div>
            <CalendarIcon className="h-10 w-10 text-primary-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-white border-l-4 border-secondary-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Asistencias aprobadas</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.approved || 0}</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-secondary-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats?.approved || 0) * 5, 100)}%` }}
                ></div>
              </div>
            </div>
            <CheckCircleIcon className="h-10 w-10 text-secondary-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent-50 to-white border-l-4 border-accent-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendientes de validación</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.pending || 0}</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-accent-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats?.pending || 0) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
            <ExclamationTriangleIcon className="h-10 w-10 text-accent-400" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tasa de asistencia</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.attendance_rate || 0}%</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.attendance_rate || 0}%` }}
                ></div>
              </div>
            </div>
            <ChartBarIcon className="h-10 w-10 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Task Progress Section */}
      <Card
        title="Progreso de Tareas"
        subtitle={`Has completado ${completedTasks.length} de ${totalTasks} tareas`}
        className="hover:shadow-xl transition-all duration-300"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Progreso General</span>
            <span className="text-2xl font-bold text-primary-600">
              {taskProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-6 rounded-full transition-all duration-700 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${taskProgress}%` }}
            >
              {taskProgress > 10 && `${taskProgress}%`}
            </div>
          </div>
        </div>
      </Card>

      {/* My Tasks con Diseño Mejorado */}
      <Card
        title="Mis Tareas Activas"
        subtitle="Tareas asignadas pendientes y en progreso"
        actions={
          <Link to="/my-tasks">
            <Button variant="outline" size="sm" className="transform hover:scale-105 transition-transform duration-200">
              Ver Todas
            </Button>
          </Link>
        }
        className="hover:shadow-xl transition-all duration-300"
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
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Fecha límite: {formatDate(task.due_date)}
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          task.status === 'in_progress'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: task.status === 'in_progress' ? '50%' : '0%' }}
                      ></div>
                    </div>
                  </div>
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

      {/* Task Stats Cards con Diseño Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tareas Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.pending.length}</p>
              <div className="flex items-center mt-1">
                <ClockIcon className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-xs text-gray-500">Por iniciar</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Progreso</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.in_progress.length}</p>
              <div className="flex items-center mt-1">
                <PlayIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-xs text-gray-500">Desarrollando</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <PlayIcon className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completadas</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.completed.length}</p>
              <div className="flex items-center mt-1">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-gray-500">Finalizadas</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Info con Diseño Mejorado */}
      <Card
        title="Información Adicional"
        className="hover:shadow-xl transition-all duration-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <ClockIcon className="h-5 w-5 text-primary-500 mr-2" />
              Horario de Prácticas
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Entrada:</span>
                <span className="font-medium text-primary-700">
                  {user?.entry_time ? formatTime(user.entry_time) : 'No especificado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Salida:</span>
                <span className="font-medium text-primary-700">
                  {user?.exit_time ? formatTime(user.exit_time) : 'No especificado'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-secondary-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <CalendarIcon className="h-5 w-5 text-secondary-500 mr-2" />
              Periodo de Prácticas
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Inicio:</span>
                <span className="font-medium text-secondary-700">
                  {user?.start_date ? formatDate(user.start_date) : 'No especificado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fin estimado:</span>
                <span className="font-medium text-secondary-700">
                  {user?.end_date ? formatDate(user.end_date) : 'No especificado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InternDashboard;
