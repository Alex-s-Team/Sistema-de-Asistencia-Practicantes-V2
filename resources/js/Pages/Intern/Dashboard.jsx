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
  EyeIcon, // ✅ AÑADIDO
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
        <LoadingSpinner size="large" message="Cargando tu dashboard..." />
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
      {/* Welcome Header Mejorado */}
      <div className="bg-gradient-to-r from-[#3484A5] to-[#2CA792] rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-bold mb-3">
              ¡Bienvenido, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-white/90 text-lg mb-1">
              Hoy es {formatDate(new Date(), 'EEEE, dd MMMM yyyy')}
            </p>
            <p className="text-white/70 flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              {user?.position || 'Practicante'} - {user?.university || 'Universidad'}
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <UserCircleIcon className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} className="animate-slide-up" />
      )}

      {/* Quick Actions con Diseño Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marcar Entrada */}
        <Card className="bg-gradient-to-br from-[#3484A5]/10 to-white border-2 border-[#3484A5]/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ClockIcon className="h-6 w-6 text-[#3484A5]" />
                Marcar Entrada
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {hasMarkedEntry
                  ? `✅ Entrada registrada a las ${formatTime(todayAttendance.entry_time)}`
                  : '📝 Aún no has marcado tu entrada de hoy'
                }
              </p>
              <Link to="/mark-attendance">
                <Button
                  variant={hasMarkedEntry ? "outline" : "primary"}
                  disabled={hasMarkedEntry}
                  className="w-full py-3 bg-gradient-to-r from-[#3484A5] to-[#2CA792] hover:from-[#2CA792] hover:to-[#3484A5] transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  {hasMarkedEntry ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      Entrada Marcada
                    </div>
                  ) : (
                    '📍 Marcar Entrada'
                  )}
                </Button>
              </Link>
            </div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ml-4 transform transition-all duration-300 group-hover:scale-110 ${
              hasMarkedEntry ? 'bg-[#2CA792]' : 'bg-[#3484A5]'
            }`}>
              <ClockIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>

        {/* Marcar Salida */}
        <Card className="bg-gradient-to-br from-[#2CA792]/10 to-white border-2 border-[#2CA792]/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircleIcon className="h-6 w-6 text-[#2CA792]" />
                Marcar Salida
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {hasMarkedExit
                  ? `✅ Salida registrada a las ${formatTime(todayAttendance.exit_time)}`
                  : hasMarkedEntry
                    ? '⏰ Marca tu salida al finalizar tu jornada'
                    : '📋 Primero debes marcar tu entrada'
                }
              </p>
              <Link to="/mark-attendance">
                <Button
                  variant={hasMarkedExit ? "outline" : "secondary"}
                  disabled={!hasMarkedEntry || hasMarkedExit}
                  className="w-full py-3 bg-gradient-to-r from-[#2CA792] to-[#3484A5] hover:from-[#3484A5] hover:to-[#2CA792] transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  {hasMarkedExit ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      Salida Marcada
                    </div>
                  ) : (
                    '🚪 Marcar Salida'
                  )}
                </Button>
              </Link>
            </div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ml-4 transform transition-all duration-300 group-hover:scale-110 ${
              hasMarkedExit ? 'bg-[#2CA792]' : 'bg-[#2CA792]'
            }`}>
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Status Alerts con Diseño Mejorado */}
      {todayAttendance?.is_remote_entry && (
        <Alert
          type="warning"
          message={`🌐 Has registrado asistencia en modo remoto. Motivo: ${todayAttendance.remote_entry_reason || 'No especificado'}. Esperando validación.`}
          className="animate-slide-up border-l-4 border-[#F0C84F]"
        />
      )}

      {todayAttendance?.has_delay && (
        <Alert
          type="warning"
          message={`⏰ Has registrado un retraso hoy. Tu asistencia está pendiente de aprobación.`}
          className="animate-slide-up border-l-4 border-[#F0C84F]"
        />
      )}

      {/* Stats Grid con Diseño Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Días Registrados */}
        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-[#3484A5] transform transition-all duration-300 hover:scale-105 hover:shadow-xl group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Días registrados
              </p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-[#3484A5] transition-colors">
                {stats?.total || 0}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-[#3484A5] h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats?.total || 0) * 5, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Asistencias Aprobadas */}
        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-[#2CA792] transform transition-all duration-300 hover:scale-105 hover:shadow-xl group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                Asistencias aprobadas
              </p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-[#2CA792] transition-colors">
                {stats?.approved || 0}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-[#2CA792] h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats?.approved || 0) * 5, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Pendientes de Validación */}
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-[#F0C84F] transform transition-all duration-300 hover:scale-105 hover:shadow-xl group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Pendientes de validación
              </p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-[#F0C84F] transition-colors">
                {stats?.pending || 0}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-[#F0C84F] h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats?.pending || 0) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tasa de Asistencia */}
        <Card className="bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4" />
                Tasa de asistencia
              </p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                {stats?.attendance_rate || 0}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${stats?.attendance_rate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Task Progress Section */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-6 w-6 text-[#3484A5]" />
            <span>Progreso de Tareas</span>
          </div>
        }
        subtitle={`Has completado ${completedTasks.length} de ${totalTasks} tareas`}
        className="transform transition-all duration-300 hover:shadow-xl"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium text-lg">Progreso General</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-[#3484A5] to-[#2CA792] bg-clip-text text-transparent">
              {taskProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-[#3484A5] to-[#2CA792] h-6 rounded-full transition-all duration-1000 flex items-center justify-center text-white text-sm font-semibold shadow-lg"
              style={{ width: `${taskProgress}%` }}
            >
              {taskProgress > 10 && `${taskProgress}% completado`}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#3484A5]/10 rounded-xl p-3">
              <p className="text-2xl font-bold text-[#3484A5]">{tasks.pending.length}</p>
              <p className="text-xs text-gray-600">Pendientes</p>
            </div>
            <div className="bg-[#F0C84F]/10 rounded-xl p-3">
              <p className="text-2xl font-bold text-[#F0C84F]">{tasks.in_progress.length}</p>
              <p className="text-xs text-gray-600">En Progreso</p>
            </div>
            <div className="bg-[#2CA792]/10 rounded-xl p-3">
              <p className="text-2xl font-bold text-[#2CA792]">{tasks.completed.length}</p>
              <p className="text-xs text-gray-600">Completadas</p>
            </div>
          </div>
        </div>
      </Card>

      {/* My Tasks con Diseño Mejorado */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <PlayIcon className="h-6 w-6 text-[#F0C84F]" />
            <span>Mis Tareas Activas</span>
          </div>
        }
        subtitle="Tareas asignadas pendientes y en progreso"
        actions={
          <Link to="/my-tasks">
            <Button variant="outline" size="sm" className="flex items-center gap-2 transform hover:scale-105 transition-transform duration-200">
              <EyeIcon className="h-4 w-4" />
              Ver Todas
            </Button>
          </Link>
        }
        className="transform transition-all duration-300 hover:shadow-xl"
      >
        {activeTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardDocumentListIcon className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-600 mb-2">No tienes tareas activas</p>
            <p className="text-sm text-gray-500">Las tareas asignadas aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.slice(0, 5).map((task, index) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#F0C84F]/30 transition-all duration-300 group hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                    task.status === 'in_progress' ? 'bg-[#F0C84F]' : 'bg-[#3484A5]'
                  }`}>
                    {task.status === 'in_progress' ? (
                      <PlayIcon className="h-6 w-6 text-white" />
                    ) : (
                      <ClockIcon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#3484A5] transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Fecha límite: {formatDate(task.due_date)}
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          task.status === 'in_progress'
                            ? 'bg-[#F0C84F]'
                            : 'bg-[#3484A5]'
                        }`}
                        style={{ width: task.status === 'in_progress' ? '50%' : '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge type="priority" value={task.priority} className="px-3 py-2">
                    {task.priority === 'high' ? '🔥 Alta' : task.priority === 'medium' ? '⚡ Media' : '📋 Baja'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Additional Info con Diseño Mejorado */}
      <Card
        title="Información de Prácticas"
        className="transform transition-all duration-300 hover:shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#3484A5]/10 to-white rounded-2xl p-6 border border-[#3484A5]/20">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <ClockIcon className="h-6 w-6 text-[#3484A5]" />
              Horario de Prácticas
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-sm text-gray-600">Entrada:</span>
                <span className="font-bold text-[#3484A5] text-lg">
                  {user?.entry_time ? formatTime(user.entry_time) : 'No especificado'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-sm text-gray-600">Salida:</span>
                <span className="font-bold text-[#3484A5] text-lg">
                  {user?.exit_time ? formatTime(user.exit_time) : 'No especificado'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#2CA792]/10 to-white rounded-2xl p-6 border border-[#2CA792]/20">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <CalendarIcon className="h-6 w-6 text-[#2CA792]" />
              Periodo de Prácticas
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-sm text-gray-600">Inicio:</span>
                <span className="font-bold text-[#2CA792] text-lg">
                  {user?.start_date ? formatDate(user.start_date) : 'No especificado'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-sm text-gray-600">Fin estimado:</span>
                <span className="font-bold text-[#2CA792] text-lg">
                  {user?.end_date ? formatDate(user.end_date) : 'No especificado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer del Dashboard */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-full px-6 py-3">
          <div className="w-2 h-2 bg-[#2CA792] rounded-full animate-pulse"></div>
          Sistema actualizado • {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;