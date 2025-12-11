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
  ChartBarIcon,
  ClockIcon,
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
        <div className="relative rounded-2xl p-8 shadow-xl bg-gradient-to-br from-[#0C3C60] to-[#14577A] text-white overflow-hidden">

        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute top-10 left-24 w-20 h-20 bg-white/5 blur-xl rounded-full"></div>

        {/* CONTENIDO */}
        <div className="flex items-center justify-between relative z-10">

        {/* Texto */}
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

        {/* Icono decorativo */}
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
        
        {/* Total Trabajadores */}
        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-[#3484A5] transform transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Total Trabajadores
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
                Trabajadores Activos
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
 
 {/* Trabajadores Activos */}
<Card
  title={
    <div className="flex items-center gap-2">
      <UsersIcon className="h-6 w-6 text-[#0C3C60]" />
      <span className="font-semibold text-gray-800">Trabajadores Activos</span>
    </div>
  }
  subtitle="Lista de trabajadores registrados en el sistema"
  actions={
    <Link to="/users">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 border-[#0C3C60]/40 text-[#0C3C60] hover:bg-[#0C3C60] hover:text-white transition-all duration-300"
      >
        <EyeIcon className="h-4 w-4" />
        Ver Todos
      </Button>
    </Link>
  }
  className="transform transition-all duration-300 hover:shadow-xl bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100"
>
  {recentData.interns.length === 0 ? (
    
    /* ESTADO VACÍO MEJORADO */
    <div className="text-center py-12 text-gray-500">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner rounded-2xl flex items-center justify-center mx-auto mb-4">
        <UsersIcon className="h-12 w-12 text-gray-400" />
      </div>
      <p className="text-lg font-semibold text-gray-600 mb-1">No hay trabajadores activos</p>
      <p className="text-sm text-gray-500">Aparecerán aquí cuando se registren en el sistema.</p>
    </div>

  ) : (
    
    /* LISTA MEJORADA */
    <div className="space-y-4">
      {recentData.interns.map((intern, index) => (
        <div
          key={intern.id}
          className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl border border-gray-200 
                     hover:border-[#0C3C60]/40 hover:shadow-md transition-all duration-300 group"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="flex items-center gap-4 flex-1">
            
            {/* Avatar Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-[#0C3C60] to-[#14577A] 
                            rounded-xl flex items-center justify-center shadow-md 
                            group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg drop-shadow-sm">
                {intern.name?.charAt(0) || "U"}
              </span>
            </div>

            {/* Text Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 group-hover:text-[#0C3C60] transition-colors text-base">
                {intern.name}
              </h4>
              <p className="text-sm text-gray-600">
                {intern.position || "Trabajador"}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPinIcon className="h-3 w-3 text-[#0C3C60]" />
                DNI: {intern.dni}
              </p>
            </div>
          </div>

          {/* Badge Activo */}
          <Badge
            type="status"
            value="success"
            className="px-3 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg"
          >
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
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
        {/* Resumen del Sistema — Versión Premium */}
<Card 
  title={
    <span className="text-lg font-semibold text-[#0C3C60] flex items-center gap-2">
      <ClipboardDocumentCheckIcon className="h-5 w-5 text-[#0C3C60]" />
      Resumen del Sistema
    </span>
  }
  className="transform transition-all duration-300 hover:shadow-2xl bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl"
>
  <div className="space-y-4">

    {/* Total Usuarios */}
    <div className="flex justify-between items-center p-4 rounded-xl 
                    bg-white shadow-sm border border-gray-200 
                    hover:border-[#0C3C60]/40 hover:shadow-md transition-all">
      <span className="text-gray-700 flex items-center gap-2">
        <UsersIcon className="h-5 w-5 text-[#0C3C60]" />
        Total de Usuarios:
      </span>
      <span className="font-bold text-[#0C3C60]">{stats.totalInterns + 3}</span>
    </div>

    {/* Trabajadores Activos */}
    <div className="flex justify-between items-center p-4 rounded-xl 
                    bg-white shadow-sm border border-gray-200 
                    hover:border-[#2CA792]/40 hover:shadow-md transition-all">
      <span className="text-gray-700 flex items-center gap-2">
        <CheckCircleIcon className="h-5 w-5 text-[#2CA792]" />
        Trabajadores Activos:
      </span>
      <span className="font-bold text-[#2CA792]">{stats.activeInterns}</span>
    </div>

    {/* Personal Supervisora */}
    <div className="flex justify-between items-center p-4 rounded-xl 
                    bg-white shadow-sm border border-gray-200 
                    hover:border-[#0C3C60]/30 hover:shadow-md transition-all">
      <span className="text-gray-700 flex items-center gap-2">
        <UsersIcon className="h-5 w-5 text-[#0C3C60]" />
        Personal de Supervisión:
      </span>
      <span className="font-bold text-[#0C3C60]">3</span>
    </div>

    {/* Tasa de Finalización */}
    <div className="flex justify-between items-center p-4 rounded-xl 
                    bg-white shadow-sm border border-gray-200 
                    hover:border-purple-400/40 hover:shadow-md transition-all">
      <span className="text-gray-700 flex items-center gap-2">
        <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-600" />
        Tasa de Finalización:
      </span>
      <span className="font-bold text-purple-600">
        {stats.totalTasks > 0 
          ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
          : 0}%
      </span>
    </div>
  </div>
</Card>


        {/* Acciones Rápidas */}
        <Card 
          title="Acciones Rápidas"
          className="transform transition-all duration-300 hover:shadow-lg"
        >
          <div className="space-y-3">

            {/* Opción */}
            <Link to="/users?action=new">
              <div className="flex items-center gap-4 p-4 border border-[#3484A5]/40 rounded-xl 
                              hover:bg-[#3484A5]/5 transition-all cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-[#3484A5] flex items-center justify-center text-white">
                  +
                </div>
                <span className="font-medium text-gray-700">
                  Registrar Nuevo Practicante
                </span>
              </div>
            </Link>

            {/* Opción */}
            <Link to="/tasks?action=new">
              <div className="flex items-center gap-4 p-4 border border-[#2CA792]/40 rounded-xl 
                              hover:bg-[#2CA792]/5 transition-all cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-[#2CA792] flex items-center justify-center text-white">
                  +
                </div>
                <span className="font-medium text-gray-700">
                  Crear Nueva Tarea
                </span>
              </div>
            </Link>

            {/* Opción */}
            <Link to="/reports">
              <div className="flex items-center gap-4 p-4 border border-[#F0C84F]/40 rounded-xl 
                              hover:bg-[#F0C84F]/10 transition-all cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-[#F0C84F] flex items-center justify-center text-white">
                  <ChartBarIcon className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-700">
                  Ver Reportes y Estadísticas
                </span>
              </div>
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