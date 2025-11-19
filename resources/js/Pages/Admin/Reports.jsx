import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../Services/attendanceService';
import { userService } from '../../Services/userService';
import { taskService } from '../../Services/taskService';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Select } from '../../Components/Common/Select';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Badge } from '../../Components/Common/Badge';
import * as XLSX from 'xlsx';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  ArrowPathIcon,
  FunnelIcon,
  UserGroupIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../Utils/helpers';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRemoteOnly, setShowRemoteOnly] = useState(false);
  const [showDelaysOnly, setShowDelaysOnly] = useState(false);
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
      approvedAttendances: 0,
      pendingAttendances: 0,
      rejectedAttendances: 0,
      remoteAttendances: 0,
      avgDelayMinutes: 0,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  // ✅ FIX: Solo generar reporte cuando los interns estén cargados
  useEffect(() => {
    if (interns.length > 0) {
      console.log('✅ Interns cargados, generando reporte inicial');
      generateReport();
    }
  }, [interns]);

  // Regenerar cuando cambien los filtros
  useEffect(() => {
    if (interns.length > 0) {
      console.log('🔄 Filtros cambiados, regenerando reporte');
      generateReport();
    }
  }, [selectedIntern, dateRange, statusFilter, showRemoteOnly, showDelaysOnly]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando practicantes...');
      
      const internsResponse = await userService.getInterns();
      const internsData = internsResponse.data || internsResponse || [];
      
      console.log('👥 Practicantes cargados:', internsData.length);
      setInterns(internsData);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      console.log('📊 Generando reporte...');

      const params = {
        start_date: dateRange.start,
        end_date: dateRange.end,
      };

      if (selectedIntern !== 'all') {
        params.user_id = selectedIntern;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      console.log('📋 Parámetros:', params);

      const [attendancesResponse, tasksResponse] = await Promise.all([
        attendanceService.getAttendances(params),
        taskService.getTasks(params),
      ]);

      let attendances = attendancesResponse.data || attendancesResponse || [];
      
      // Aplicar filtros adicionales del frontend
      if (showRemoteOnly) {
        attendances = attendances.filter(a => a.is_remote_entry || a.is_remote_exit);
      }
      
      if (showDelaysOnly) {
        attendances = attendances.filter(a => a.has_delay);
      }

      // Procesar tareas
      let tasksList = {
        pending: [],
        in_progress: [],
        completed: [],
      };
      
      const tasksData = tasksResponse.data || tasksResponse || [];
      
      if (Array.isArray(tasksData)) {
        tasksList.pending = tasksData.filter(t => t.status === 'pending');
        tasksList.in_progress = tasksData.filter(t => t.status === 'in_progress');
        tasksList.completed = tasksData.filter(t => t.status === 'completed');
      } else if (typeof tasksData === 'object') {
        tasksList = {
          pending: tasksData.pending || [],
          in_progress: tasksData.in_progress || [],
          completed: tasksData.completed || [],
        };
      }

      const allTasks = [...tasksList.pending, ...tasksList.in_progress, ...tasksList.completed];

      // Calcular métricas
      const totalDays = Math.ceil(
        (new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)
      ) + 1;

      const presentDays = attendances.filter(a => a.entry_time).length;
      const delays = attendances.filter(a => a.has_delay).length;
      const completedTasks = tasksList.completed.length;
      const approvedAttendances = attendances.filter(a => a.status === 'approved').length;
      const pendingAttendances = attendances.filter(a => a.status === 'pending').length;
      const rejectedAttendances = attendances.filter(a => a.status === 'rejected').length;
      const remoteAttendances = attendances.filter(a => a.is_remote_entry || a.is_remote_exit).length;
      
      // Calcular promedio de minutos de retraso
      const delaysWithMinutes = attendances.filter(a => a.has_delay && a.delay_minutes > 0);
      const avgDelayMinutes = delaysWithMinutes.length > 0
        ? Math.round(delaysWithMinutes.reduce((sum, a) => sum + a.delay_minutes, 0) / delaysWithMinutes.length)
        : 0;

      const summary = {
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        delays,
        attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
        completedTasks,
        totalTasks: allTasks.length,
        approvedAttendances,
        pendingAttendances,
        rejectedAttendances,
        remoteAttendances,
        avgDelayMinutes,
      };

      console.log('✅ Resumen:', summary);

      setReportData({
        attendances,
        tasks: tasksList,
        summary,
      });
    } catch (error) {
      console.error('❌ Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      // Preparar datos para Excel
      const attendanceData = reportData.attendances.map(a => ({
        'Fecha': formatDate(a.date),
        'Practicante': a.user?.name || 'N/A',
        'Entrada': a.entry_time || '-',
        'Salida': a.exit_time || '-',
        'Estado': a.status === 'approved' ? 'Aprobado' : a.status === 'pending' ? 'Pendiente' : 'Rechazado',
        'Retraso': a.has_delay ? `Sí (${a.delay_minutes}min)` : 'No',
        'Remoto': (a.is_remote_entry || a.is_remote_exit) ? 'Sí' : 'No',
        'Distancia (m)': a.distance_from_office || '-',
        'IP': a.entry_ip || a.exit_ip || '-',
      }));

      const summaryData = [
        { 'Métrica': 'Días Totales', 'Valor': reportData.summary.totalDays },
        { 'Métrica': 'Días Presentes', 'Valor': reportData.summary.presentDays },
        { 'Métrica': 'Días Ausentes', 'Valor': reportData.summary.absentDays },
        { 'Métrica': 'Retrasos', 'Valor': reportData.summary.delays },
        { 'Métrica': 'Promedio Retraso (min)', 'Valor': reportData.summary.avgDelayMinutes },
        { 'Métrica': 'Tasa de Asistencia (%)', 'Valor': reportData.summary.attendanceRate },
        { 'Métrica': 'Asistencias Aprobadas', 'Valor': reportData.summary.approvedAttendances },
        { 'Métrica': 'Asistencias Pendientes', 'Valor': reportData.summary.pendingAttendances },
        { 'Métrica': 'Asistencias Rechazadas', 'Valor': reportData.summary.rejectedAttendances },
        { 'Métrica': 'Registros Remotos', 'Valor': reportData.summary.remoteAttendances },
        { 'Métrica': 'Tareas Totales', 'Valor': reportData.summary.totalTasks },
        { 'Métrica': 'Tareas Completadas', 'Valor': reportData.summary.completedTasks },
      ];

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      
      // Hoja de resumen
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
      
      // Hoja de asistencias
      const wsAttendance = XLSX.utils.json_to_sheet(attendanceData);
      XLSX.utils.book_append_sheet(wb, wsAttendance, 'Asistencias');

      // Generar archivo
      const fileName = `Reporte_Asistencias_${dateRange.start}_${dateRange.end}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('✅ Excel exportado:', fileName);
    } catch (error) {
      console.error('❌ Error exportando Excel:', error);
      alert('Error al exportar a Excel');
    }
  };

  const exportToPDF = async () => {
    alert('Exportación a PDF en desarrollo. Por ahora usa Excel.');
  };

  const refreshReport = () => {
    console.log('🔄 Refrescando reporte...');
    generateReport();
  };

  const resetFilters = () => {
    setSelectedIntern('all');
    setStatusFilter('all');
    setShowRemoteOnly(false);
    setShowDelaysOnly(false);
    setDateRange({
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    });
  };

  if (loading && interns.length === 0) {
    return <LoadingSpinner message="Cargando reportes..." />;
  }

  const activeTasks = [...reportData.tasks.pending, ...reportData.tasks.in_progress];
  const progressPercentage = reportData.summary.totalTasks > 0
    ? Math.round((reportData.summary.completedTasks / reportData.summary.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-1">
            Análisis completo de asistencias y desempeño
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshReport} disabled={loading}>
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="success" onClick={exportToExcel}>
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Excel
          </Button>
          <Button variant="primary" onClick={exportToPDF}>
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros de Búsqueda</h3>
            <Button variant="outline" size="sm" onClick={resetFilters} className="ml-auto">
              Limpiar Filtros
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Practicante"
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
              options={[
                { value: 'all', label: '👥 Todos los practicantes' },
                ...interns.map(intern => ({
                  value: intern.id.toString(),
                  label: intern.name,
                })),
              ]}
            />

            <Select
              label="Estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'approved', label: '✅ Aprobados' },
                { value: 'pending', label: '⏳ Pendientes' },
                { value: 'rejected', label: '❌ Rechazados' },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Fecha Inicio
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
                📅 Fecha Fin
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showRemoteOnly}
                onChange={(e) => setShowRemoteOnly(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">🌐 Solo registros remotos</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDelaysOnly}
                onChange={(e) => setShowDelaysOnly(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">⏰ Solo con retrasos</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Summary Stats - Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 mb-1 font-medium">Días del Periodo</p>
              <p className="text-4xl font-bold text-blue-900">
                {reportData.summary.totalDays}
              </p>
              <p className="text-xs text-blue-600 mt-1">días laborables</p>
            </div>
            <CalendarIcon className="h-14 w-14 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700 mb-1 font-medium">Días Presentes</p>
              <p className="text-4xl font-bold text-green-900">
                {reportData.summary.presentDays}
              </p>
              <p className="text-xs text-green-600 mt-1">asistencias registradas</p>
            </div>
            <CheckCircleIcon className="h-14 w-14 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-700 mb-1 font-medium">Retrasos</p>
              <p className="text-4xl font-bold text-red-900">
                {reportData.summary.delays}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {reportData.summary.avgDelayMinutes}min promedio
              </p>
            </div>
            <ClockIcon className="h-14 w-14 text-red-500 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 mb-1 font-medium">Tasa Asistencia</p>
              <p className="text-4xl font-bold text-purple-900">
                {reportData.summary.attendanceRate}%
              </p>
              <p className="text-xs text-purple-600 mt-1">del total esperado</p>
            </div>
            <ChartBarIcon className="h-14 w-14 text-purple-500 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-700 mb-1 font-medium">Remotos</p>
              <p className="text-4xl font-bold text-orange-900">
                {reportData.summary.remoteAttendances}
              </p>
              <p className="text-xs text-orange-600 mt-1">fuera de oficina</p>
            </div>
            <MapPinIcon className="h-14 w-14 text-orange-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Estados de Asistencia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">✅ Aprobadas</p>
              <p className="text-3xl font-bold text-green-900">
                {reportData.summary.approvedAttendances}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {reportData.summary.presentDays > 0 
                  ? Math.round((reportData.summary.approvedAttendances / reportData.summary.presentDays) * 100)
                  : 0}% del total
              </p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">⏳ Pendientes</p>
              <p className="text-3xl font-bold text-yellow-900">
                {reportData.summary.pendingAttendances}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {reportData.summary.presentDays > 0 
                  ? Math.round((reportData.summary.pendingAttendances / reportData.summary.presentDays) * 100)
                  : 0}% del total
              </p>
            </div>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-10 w-10 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">❌ Rechazadas</p>
              <p className="text-3xl font-bold text-red-900">
                {reportData.summary.rejectedAttendances}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {reportData.summary.presentDays > 0 
                  ? Math.round((reportData.summary.rejectedAttendances / reportData.summary.presentDays) * 100)
                  : 0}% del total
              </p>
            </div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <div className="text-3xl">❌</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tareas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">📋 Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.tasks.pending.length}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">⚡ En Progreso</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.tasks.in_progress.length}</p>
            </div>
            <PlayIcon className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">✅ Completadas</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.tasks.completed.length}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Tabla de Asistencias */}
      <Card
        title="📋 Detalle de Asistencias"
        subtitle={`${reportData.attendances.length} registros encontrados`}
      >
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner message="Cargando asistencias..." />
          </div>
        ) : reportData.attendances.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="h-20 w-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin registros</h3>
            <p className="text-sm">No hay asistencias que coincidan con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Practicante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalles</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.attendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(attendance.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-sm font-semibold text-primary-600">
                            {attendance.user?.name?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{attendance.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.entry_time || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.exit_time || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge type="status" value={attendance.status}>
                        {attendance.status === 'approved' ? '✅ Aprobado' :
                         attendance.status === 'pending' ? '⏳ Pendiente' : '❌ Rechazado'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {attendance.has_delay && (
                          <Badge type="status" value="warning">
                            ⏰ {attendance.delay_minutes}min
                          </Badge>
                        )}
                        {(attendance.is_remote_entry || attendance.is_remote_exit) && (
                          <Badge type="status" value="info">
                            🌐 Remoto
                          </Badge>
                        )}
                        {attendance.distance_from_office && attendance.distance_from_office > 500 && (
                          <Badge type="status" value="danger">
                            📍 {Math.round(attendance.distance_from_office)}m
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

      {/* Resumen de Tareas */}
      <Card
        title="📋 Resumen de Tareas"
        subtitle={`${reportData.summary.completedTasks} de ${reportData.summary.totalTasks} completadas`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Progreso de Tareas</span>
            <span className="text-2xl font-bold text-primary-600">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && `${progressPercentage}%`}
            </div>
          </div>

          {activeTasks.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Tareas Activas</h4>
              <div className="space-y-2">
                {activeTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        👤 {task.assigned_to?.map(u => u.name).join(', ') || 'Sin asignar'}
                      </p>
                    </div>
                    <Badge type="status" value={task.status}>
                      {task.status === 'pending' ? '📋 Pendiente' : '⚡ En Progreso'}
                    </Badge>
                  </div>
                ))}
                {activeTasks.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    ... y {activeTasks.length - 5} tareas más
                  </p>
                )}
              </div>
            </div>
          )}

          {reportData.tasks.completed.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-gray-900 mb-3">Últimas Tareas Completadas</h4>
              <div className="space-y-2">
                {reportData.tasks.completed.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        👤 {task.assigned_to?.map(u => u.name).join(', ') || 'Sin asignar'}
                      </p>
                    </div>
                    <Badge type="status" value="completed">
                      ✅ Completada
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Información Adicional */}
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserGroupIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">ℹ️ Información del Reporte</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>📅 <strong>Periodo:</strong> {formatDate(dateRange.start)} - {formatDate(dateRange.end)}</p>
              <p>👥 <strong>Practicantes:</strong> {selectedIntern === 'all' ? `Todos (${interns.length})` : interns.find(i => i.id.toString() === selectedIntern)?.name}</p>
              <p>🔍 <strong>Estado:</strong> {
                statusFilter === 'all' ? 'Todos' : 
                statusFilter === 'approved' ? 'Solo Aprobados' :
                statusFilter === 'pending' ? 'Solo Pendientes' : 'Solo Rechazados'
              }</p>
              {showRemoteOnly && <p>🌐 <strong>Filtro:</strong> Solo registros remotos</p>}
              {showDelaysOnly && <p>⏰ <strong>Filtro:</strong> Solo con retrasos</p>}
              <p className="text-xs text-gray-500 mt-2">
                📊 Última actualización: {new Date().toLocaleString('es-PE')}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;