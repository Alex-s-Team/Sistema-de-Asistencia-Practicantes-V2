import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../Services/attendanceService';
import { userService } from '../../Services/userService';
import { taskService } from '../../Services/taskService';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Select } from '../../Components/Common/Select';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Badge } from '../../Components/Common/Badge';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../Utils/helpers';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState({
    attendances: [],
    tasks: {
      pending: [],
      in_progress: [],
      completed: [],
    },
    summary: {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      delays: 0,
      attendanceRate: 0,
      completedTasks: 0,
      totalTasks: 0,
    },
  });
  const [refreshKey, setRefreshKey] = useState(0); // Añadido para forzar actualización

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (interns.length > 0) {
      generateReport();
    }
  }, [selectedIntern, dateRange, refreshKey]); // Añadido refreshKey

  const loadData = async () => {
    try {
      setLoading(true);
      const internsResponse = await userService.getInterns();
      setInterns(internsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);

      const params = {
        start_date: dateRange.start,
        end_date: dateRange.end,
      };

      if (selectedIntern !== 'all') {
        params.user_id = selectedIntern;
      }

      // Cargar datos del reporte
      const [attendancesResponse, tasksResponse] = await Promise.all([
        attendanceService.getAttendances(params),
        taskService.getTasks(params),
      ]);

      const attendances = attendancesResponse.data || [];
      
      // Procesar datos de tareas - Usando la misma estructura que en MyTasks
      let tasksList = {
        pending: [],
        in_progress: [],
        completed: [],
      };
      
      if (Array.isArray(tasksResponse.data)) {
        // Si viene como array, lo agrupamos por estado
        tasksList.pending = tasksResponse.data.filter(t => t.status === 'pending');
        tasksList.in_progress = tasksResponse.data.filter(t => t.status === 'in_progress');
        tasksList.completed = tasksResponse.data.filter(t => t.status === 'completed');
      } else if (tasksResponse.data && typeof tasksResponse.data === 'object') {
        // Si ya viene agrupado por estado
        tasksList = {
          pending: tasksResponse.data.pending || [],
          in_progress: tasksResponse.data.in_progress || [],
          completed: tasksResponse.data.completed || [],
        };
      }
      
      // Combinar todas las tareas
      const allTasks = [...tasksList.pending, ...tasksList.in_progress, ...tasksList.completed];

      // Calcular métricas
      const totalDays = Math.ceil(
        (new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)
      );

      const presentDays = attendances.filter(a => a.entry_time).length;
      const delays = attendances.filter(a => a.has_delay).length;
      const completedTasks = tasksList.completed.length;

      setReportData({
        attendances,
        tasks: tasksList,
        summary: {
          totalDays,
          presentDays,
          absentDays: totalDays - presentDays,
          delays,
          attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
          completedTasks,
          totalTasks: allTasks.length,
        },
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // Simular descarga de reporte
    alert('Funcionalidad de exportación en desarrollo. Se descargará un PDF con el reporte.');
  };

  // Función para forzar actualización del reporte
  const refreshReport = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading && interns.length === 0) {
    return <LoadingSpinner message="Cargando reportes..." />;
  }

  // Combinar tareas pendientes y en progreso
  const activeTasks = [...reportData.tasks.pending, ...reportData.tasks.in_progress];
  
  // Calcular porcentaje de progreso
  const progressPercentage = reportData.summary.totalTasks > 0
    ? Math.round((reportData.summary.completedTasks / reportData.summary.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">
            Genera reportes de asistencia y desempeño
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshReport}>
            Actualizar Datos
          </Button>
          <Button variant="primary" onClick={handleExportReport}>
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Practicante"
            value={selectedIntern}
            onChange={(e) => setSelectedIntern(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los practicantes' },
              ...interns.map(intern => ({
                value: intern.id.toString(),
                label: intern.name,
              })),
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Días Totales</p>
              <p className="text-3xl font-bold text-gray-900">
                {reportData.summary.totalDays}
              </p>
            </div>
            <CalendarIcon className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Días Presentes</p>
              <p className="text-3xl font-bold text-gray-900">
                {reportData.summary.presentDays}
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-green-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Retrasos</p>
              <p className="text-3xl font-bold text-gray-900">
                {reportData.summary.delays}
              </p>
            </div>
            <ClockIcon className="h-12 w-12 text-red-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tasa Asistencia</p>
              <p className="text-3xl font-bold text-gray-900">
                {reportData.summary.attendanceRate}%
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </Card>
      </div>

      {/* Task Stats Cards - Añadido para mostrar estadísticas de tareas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tareas Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.tasks.pending.length}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Progreso</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.tasks.in_progress.length}</p>
            </div>
            <PlayIcon className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completadas</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.tasks.completed.length}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Attendance Details */}
      <Card
        title="Detalle de Asistencias"
        subtitle={`${reportData.attendances.length} registros encontrados`}
      >
        {reportData.attendances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>No hay registros de asistencia en el periodo seleccionado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Practicante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.attendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(attendance.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.user?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.entry_time || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.exit_time || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Badge type="status" value={attendance.status}>
                          {attendance.status === 'approved' ? 'Aprobado' :
                           attendance.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </Badge>
                        {attendance.has_delay && (
                          <Badge type="status" value="warning">
                            Retraso
                          </Badge>
                        )}
                        {attendance.is_remote_entry && (
                          <Badge type="status" value="info">
                            Remoto
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Tasks Summary - Actualizado para mostrar correctamente el progreso */}
      <Card
        title="Resumen de Tareas"
        subtitle={`${reportData.summary.completedTasks} de ${reportData.summary.totalTasks} completadas`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Progreso de Tareas</span>
            <span className="font-semibold">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-primary-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {activeTasks.length > 0 && (
            <div className="mt-4 space-y-2">
              {activeTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      Asignado a: {task.assigned_to?.map(u => u.name).join(', ')}
                    </p>
                  </div>
                  <Badge type="status" value={task.status}>
                    {task.status === 'pending' ? 'Pendiente' :
                     task.status === 'in_progress' ? 'En Progreso' : 'Completada'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;