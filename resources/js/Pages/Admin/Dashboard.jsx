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
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  EyeIcon,
  MapPinIcon,
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

      const [internsData, pendingData, tasksData] = await Promise.all([
        userService.getInterns(),
        attendanceService.getPending(),
        taskService.getTasks(),
      ]);

      // Procesar datos
      let tasksList = {
        pending: [],
        in_progress: [],
        completed: [],
      };
      
      if (Array.isArray(tasksData)) {
        tasksList.pending = tasksData.filter(t => t.status === 'pending');
        tasksList.in_progress = tasksData.filter(t => t.status === 'in_progress');
        tasksList.completed = tasksData.filter(t => t.status === 'completed');
      } else if (tasksData && typeof tasksData === 'object') {
        tasksList = {
          pending: tasksData.pending || [],
          in_progress: tasksData.in_progress || [],
          completed: tasksData.completed || [],
        };
      }
      
      setTasks(tasksList);
      
      const allTasks = [...tasksList.pending, ...tasksList.in_progress, ...tasksList.completed];
      const interns = Array.isArray(internsData) ? internsData : [];
      const pending = Array.isArray(pendingData) ? pendingData : [];
      
      setStats({
        totalInterns: interns.length,
        activeInterns: interns.filter(i => i.is_active).length,
        pendingAttendances: pending.length,
        pendingJustifications: 0,
        todayAttendances: 0,
        totalTasks: allTasks.length,
        pendingTasks: tasksList.pending.length,
        inProgressTasks: tasksList.in_progress.length,
        completedTasks: tasksList.completed.length,
      });

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
        <LoadingSpinner size="large" message="Cargando dashboard..." />
      </div>
    );
  }

  const activeTasks = [...tasks.pending, ...tasks.in_progress];
  const attendanceRate = stats.totalInterns > 0 ? Math.round((stats.activeInterns / stats.totalInterns) * 100) : 0;

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
              Panel de Administración
            </h1>
            <p className="text-white/90 text-lg mb-1">
              Bienvenido, <span className="font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{user?.name}</span>
            </p>
            <p className="text-white/70 flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5" />
              {formatDate(new Date(), 'EEEE, dd MMMM yyyy')}
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <UsersIcon className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')} 
          className="animate-slide-up"
        />
      )}

      {/* Stats Grid Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Practicantes */}
        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-[#3484A5] transform transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Total Practicantes
              </p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-[#3484A5] transition-colors duration-300">
                {stats.totalInterns}
              </p>
              <p className="text-xs text-gray-500 mt-1">registrados en el sistema</p>
            </div>
            <div className="w-14 h-14 bg-[#3484A5] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <UsersIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </Card>

        {/* Practicantes Activos */}
        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-[#2CA792] transform transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                Practicantes Activos
              </p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-[#2CA792] transition-colors duration-300">
                {stats.activeInterns}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {attendanceRate}% de asistencia
              </p>
            </div>
            <div className="w-14 h-14 bg-[#2CA792] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <CheckCircleIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </Card>

        {/* Asistencias Pendientes */}
        <Link to="/validate-attendance">
          <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-[#F0C84F] transform transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  Asistencias Pendientes
                </p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-[#F0C84F] transition-colors duration-300">
                  {stats.pendingAttendances}
                </p>
                <p className="text-xs text-gray-500 mt-1">por validar</p>
              </div>
              <div className="w-14 h-14 bg-[#F0C84F] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ClockIcon className="h-7 w-7 text-white" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Tareas Activas */}
        <Link to="/tasks">
          <Card className="bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <ClipboardDocumentCheckIcon className="h-4 w-4" />
                  Tareas Activas
                </p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                  {stats.pendingTasks + stats.inProgressTasks}
                </p>
                <p className="text-xs text-gray-500 mt-1">pendientes y en progreso</p>
              </div>
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ClipboardDocumentCheckIcon className="h-7 w-7 text-white" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Quick Actions Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Validar Asistencias */}
        <Link to="/validate-attendance">
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-[#3484A5]/10 to-white border-2 border-transparent hover:border-[#3484A5]/30 group transform hover:scale-105">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3484A5] to-[#2CA792] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Validar Asistencias</h3>
              <p className="text-sm text-gray-600 mb-4">
                {stats.pendingAttendances} pendientes de aprobación
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[#3484A5] to-[#2CA792] h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats.pendingAttendances / Math.max(stats.totalInterns, 1)) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </Card>
        </Link>

        {/* Gestionar Usuarios */}
        <Link to="/users">
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-[#2CA792]/10 to-white border-2 border-transparent hover:border-[#2CA792]/30 group transform hover:scale-105">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2CA792] to-[#3484A5] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Gestionar Usuarios</h3>
              <p className="text-sm text-gray-600 mb-4">
                {stats.totalInterns} practicantes registrados
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-[#2CA792] font-semibold">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span>{stats.activeInterns} activos ({attendanceRate}%)</span>
              </div>
            </div>
          </Card>
        </Link>

        {/* Gestionar Tareas */}
        <Link to="/tasks">
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-white border-2 border-transparent hover:border-blue-200 group transform hover:scale-105">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Gestionar Tareas</h3>
              <p className="text-sm text-gray-600 mb-4">
                {stats.totalTasks} tareas registradas
              </p>
              <div className="flex items-center justify-center gap-3">
                <Badge type="status" value="success" className="px-3 py-1">
                  {stats.completedTasks} ✓
                </Badge>
                <Badge type="status" value="warning" className="px-3 py-1">
                  {stats.pendingTasks + stats.inProgressTasks} ⚡
                </Badge>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Practicantes Activos */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-[#3484A5]" />
            <span>Practicantes Activos</span>
          </div>
        }
        subtitle="Lista de practicantes registrados en el sistema"
        actions={
          <Link to="/users">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4" />
              Ver Todos
            </Button>
          </Link>
        }
        className="transform transition-all duration-300 hover:shadow-xl"
      >
        {recentData.interns.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-600 mb-2">No hay practicantes activos</p>
            <p className="text-sm text-gray-500">Los practicantes aparecerán aquí una vez registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentData.interns.map((intern, index) => (
              <div
                key={intern.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#3484A5]/30 transition-all duration-300 group hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3484A5] to-[#2CA792] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {intern.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#3484A5] transition-colors">
                      {intern.name}
                    </h4>
                    <p className="text-sm text-gray-600">{intern.position || 'Practicante'}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPinIcon className="h-3 w-3" />
                      DNI: {intern.dni}
                    </p>
                  </div>
                </div>
                <Badge type="status" value="success" className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    Activo
                  </div>
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Asistencias Pendientes */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-[#F0C84F]" />
            <span>Asistencias Pendientes de Validación</span>
          </div>
        }
        subtitle="Registros que requieren tu aprobación"
        actions={
          <Link to="/validate-attendance">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4" />
              Ver Todas
            </Button>
          </Link>
        }
        className="transform transition-all duration-300 hover:shadow-xl"
      >
        {recentData.pendingAttendances.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-20 h-20 bg-[#F0C84F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-10 w-10 text-[#F0C84F]" />
            </div>
            <p className="text-lg font-semibold text-gray-600 mb-2">¡Todo al día!</p>
            <p className="text-sm text-gray-500">No hay asistencias pendientes de validación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentData.pendingAttendances.map((attendance, index) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-100 hover:border-[#F0C84F] transition-all duration-300 group hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-[#F0C84F] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {attendance.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {attendance.user?.name || 'Usuario'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(attendance.date)} - {attendance.entry_time ? 'Entrada' : 'Salida'}
                    </p>
                    {attendance.is_remote_entry && (
                      <p className="text-xs text-[#F0C84F] mt-1 flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        Registro remoto
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {attendance.has_delay && (
                    <Badge type="status" value="warning" className="px-3 py-2">
                      ⏰ Retraso
                    </Badge>
                  )}
                  <Badge type="status" value="pending" className="px-3 py-2">
                    ⏳ Pendiente
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* System Info y Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumen del Sistema */}
        <Card 
          title="Resumen del Sistema"
          className="transform transition-all duration-300 hover:shadow-xl"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-gray-600 flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Total Usuarios:
              </span>
              <span className="font-semibold text-gray-900">{stats.totalInterns + 3}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-white rounded-lg hover:bg-green-50 transition-colors">
              <span className="text-gray-600 flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-[#2CA792]" />
                Practicantes Activos:
              </span>
              <span className="font-semibold text-[#2CA792]">{stats.activeInterns}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg hover:bg-blue-50 transition-colors">
              <span className="text-gray-600 flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-[#3484A5]" />
                Personal de Oficina:
              </span>
              <span className="font-semibold text-[#3484A5]">3</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-white rounded-lg hover:bg-purple-50 transition-colors">
              <span className="text-gray-600 flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="h-4 w-4 text-purple-500" />
                Tasa de Finalización:
              </span>
              <span className="font-semibold text-purple-600">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </span>
            </div>
          </div>
        </Card>

        {/* Acciones Rápidas */}
        <Card 
          title="Acciones Rápidas"
          className="transform transition-all duration-300 hover:shadow-xl"
        >
          <div className="space-y-3">
            <Link to="/users?action=new">
              <Button variant="outline" className="w-full justify-start py-3 group hover:bg-[#3484A5] hover:text-white transition-all duration-300">
                <div className="w-8 h-8 bg-[#3484A5] text-white rounded-lg flex items-center justify-center mr-3 group-hover:bg-white group-hover:text-[#3484A5] transition-colors">
                  +
                </div>
                Registrar Nuevo Practicante
              </Button>
            </Link>
            <Link to="/tasks?action=new">
              <Button variant="outline" className="w-full justify-start py-3 group hover:bg-[#2CA792] hover:text-white transition-all duration-300">
                <div className="w-8 h-8 bg-[#2CA792] text-white rounded-lg flex items-center justify-center mr-3 group-hover:bg-white group-hover:text-[#2CA792] transition-colors">
                  +
                </div>
                Crear Nueva Tarea
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="w-full justify-start py-3 group hover:bg-[#F0C84F] hover:text-white transition-all duration-300">
                <div className="w-8 h-8 bg-[#F0C84F] text-white rounded-lg flex items-center justify-center mr-3 group-hover:bg-white group-hover:text-[#F0C84F] transition-colors">
                  <ChartBarIcon className="h-4 w-4" />
                </div>
                Ver Reportes y Estadísticas
              </Button>
            </Link>
          </div>
        </Card>
      </div>

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

export default AdminDashboard;