import React, { useState, useEffect } from 'react';
import { Card } from '../../Components/Common/Card';
import { Badge } from '../../Components/Common/Badge';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Alert } from '../../Components/Common/Alert';
import { attendanceService } from '../../Services/attendanceService';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const InternValidatedAttendances = () => {
  const [attendances, setAttendances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all'
  });

  useEffect(() => {
    loadAttendances();

    // Auto-refresh cada 30 segundos para ver cambios de estado en tiempo real
    const interval = setInterval(loadAttendances, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const loadAttendances = async () => {
    try {
      setLoading(true);

      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate
      };

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const response = await attendanceService.getAttendances(params);
      const data = response?.data || response || [];
      const attendancesArray = Array.isArray(data) ? data : [];

      // ✅ MOSTRAR TODAS LAS ASISTENCIAS (pendientes, aprobadas, rechazadas)
      setAttendances(attendancesArray);
      calculateStats(attendancesArray);

    } catch (error) {
      console.error('Error loading attendances:', error);
      setMessage({
        type: 'error',
        text: 'Error al cargar asistencias'
      });
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendancesData) => {
    const approved = attendancesData.filter(a => a.status === 'approved');
    const rejected = attendancesData.filter(a => a.status === 'rejected');
    const pending = attendancesData.filter(a => a.status === 'pending');

    // Calcular horas totales trabajadas (solo aprobadas)
    let totalMinutes = 0;
    approved.forEach(attendance => {
      if (attendance.entry_time && attendance.exit_time) {
        const hours = calculateWorkedHours(attendance.entry_time, attendance.exit_time);
        if (hours) {
          totalMinutes += hours.total;
        }
      }
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    setStats({
      totalDays: attendancesData.length,
      approvedDays: approved.length,
      rejectedDays: rejected.length,
      pendingDays: pending.length,
      totalHours: totalHours,
      totalMinutes: remainingMinutes,
      totalWorkedMinutes: totalMinutes
    });
  };

  const calculateWorkedHours = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) return null;

    const [entryH, entryM] = entryTime.split(':').map(Number);
    const [exitH, exitM] = exitTime.split(':').map(Number);

    const entryMinutes = entryH * 60 + entryM;
    const exitMinutes = exitH * 60 + exitM;

    let diffMinutes = exitMinutes - entryMinutes;

    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return { hours, minutes, total: diffMinutes };
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para obtener el badge de estado correcto
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return (
          <Badge type="success" className="inline-flex items-center gap-1">
            <CheckCircleIcon className="h-4 w-4" />
            Aprobada
          </Badge>
        );
      case 'rejected':
        return (
          <Badge type="danger" className="inline-flex items-center gap-1">
            <XCircleIcon className="h-4 w-4" />
            Rechazada
          </Badge>
        );
      case 'pending':
        return (
          <Badge type="warning" className="inline-flex items-center gap-1">
            <ExclamationCircleIcon className="h-4 w-4" />
            Pendiente
          </Badge>
        );
      default:
        return (
          <Badge type="default">
            Desconocido
          </Badge>
        );
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando asistencias..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Asistencias</h1>
        <p className="text-gray-600 mt-1">
          Historial completo de todas tus asistencias registradas
        </p>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Registros</p>
                <p className="text-3xl font-bold mt-1">{stats.totalDays}</p>
                <p className="text-xs text-blue-200 mt-1">Todas las asistencias</p>
              </div>
              <CalendarIcon className="h-12 w-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pendientes</p>
                <p className="text-3xl font-bold mt-1">{stats.pendingDays}</p>
                <p className="text-xs text-yellow-200 mt-1">
                  {stats.totalDays > 0
                    ? `${Math.round((stats.pendingDays / stats.totalDays) * 100)}%`
                    : '0%'} del total
                </p>
              </div>
              <ExclamationCircleIcon className="h-12 w-12 text-yellow-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Aprobadas</p>
                <p className="text-3xl font-bold mt-1">{stats.approvedDays}</p>
                <p className="text-xs text-green-200 mt-1">
                  {stats.totalDays > 0
                    ? `${Math.round((stats.approvedDays / stats.totalDays) * 100)}%`
                    : '0%'} del total
                </p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Rechazadas</p>
                <p className="text-3xl font-bold mt-1">{stats.rejectedDays}</p>
                <p className="text-xs text-red-200 mt-1">
                  {stats.totalDays > 0
                    ? `${Math.round((stats.rejectedDays / stats.totalDays) * 100)}%`
                    : '0%'} del total
                </p>
              </div>
              <XCircleIcon className="h-12 w-12 text-red-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Horas Aprobadas</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.totalHours}h {stats.totalMinutes}m
                </p>
                <p className="text-xs text-purple-200 mt-1">
                  {stats.totalWorkedMinutes} minutos
                </p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-purple-200" />
            </div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabla de Asistencias */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Historial de Asistencias
          </h2>
          <Badge type="info">{attendances.length} registros</Badge>
        </div>

        {attendances.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay asistencias registradas en este período</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Entrada
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Salida
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Horas
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendances.map((attendance) => {
                  const workedHours = calculateWorkedHours(
                    attendance.entry_time,
                    attendance.exit_time
                  );

                  // Determinar el color de fondo según el estado
                  let rowBgClass = 'hover:bg-gray-50';
                  if (attendance.status === 'rejected') {
                    rowBgClass = 'bg-red-50 hover:bg-red-100';
                  } else if (attendance.status === 'pending') {
                    rowBgClass = 'bg-yellow-50 hover:bg-yellow-100';
                  } else if (attendance.status === 'approved') {
                    rowBgClass = 'bg-green-50 hover:bg-green-100';
                  }

                  return (
                    <tr
                      key={attendance.id}
                      className={rowBgClass}
                    >
                      {/* Fecha */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {formatDate(attendance.date)}
                          </span>
                        </div>
                      </td>

                      {/* Entrada */}
                      <td className="px-4 py-4 text-center">
                        {attendance.entry_time ? (
                          <div>
                            <p className="font-semibold text-green-600">
                              {formatTime(attendance.entry_time)}
                            </p>
                            {attendance.has_delay && (
                              <Badge type="warning" className="mt-1">
                                Retardo: {attendance.delay_minutes}min
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Salida */}
                      <td className="px-4 py-4 text-center">
                        {attendance.exit_time ? (
                          <p className="font-semibold text-blue-600">
                            {formatTime(attendance.exit_time)}
                          </p>
                        ) : (
                          <Badge type="warning">Sin salida</Badge>
                        )}
                      </td>

                      {/* Horas Trabajadas */}
                      <td className="px-4 py-4 text-center">
                        {workedHours && attendance.status === 'approved' ? (
                          <div>
                            <p className="text-xl font-bold text-gray-900">
                              {workedHours.hours}h {workedHours.minutes}m
                            </p>
                          </div>
                        ) : workedHours && attendance.status === 'pending' ? (
                          <div>
                            <p className="text-xl font-bold text-yellow-600">
                              {workedHours.hours}h {workedHours.minutes}m
                            </p>
                            <p className="text-xs text-yellow-600">Por aprobar</p>
                          </div>
                        ) : workedHours && attendance.status === 'rejected' ? (
                          <span className="text-gray-400 text-sm line-through">
                            {workedHours.hours}h {workedHours.minutes}m
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {getStatusBadge(attendance.status)}
                          {attendance.is_remote_entry && (
                            <Badge type="info">Remoto</Badge>
                          )}
                        </div>
                      </td>

                      {/* Detalles */}
                      <td className="px-4 py-4">
                        <div className="text-sm space-y-1">
                          {attendance.distance_from_office && (
                            <p className="text-gray-600">
                              📍 {Math.round(attendance.distance_from_office)}m de oficina
                            </p>
                          )}

                          {/* Mostrar notas del admin solo si la asistencia está validada */}
                          {(attendance.status === 'approved' || attendance.status === 'rejected') &&
                           attendance.validation_notes && (
                            <div className={`border rounded p-2 mt-2 ${
                              attendance.status === 'rejected'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-green-50 border-green-200'
                            }`}>
                              <p className={`text-xs font-semibold mb-1 ${
                                attendance.status === 'rejected'
                                  ? 'text-red-800'
                                  : 'text-green-800'
                              }`}>
                                Nota del Administrador:
                              </p>
                              <p className={`text-xs ${
                                attendance.status === 'rejected'
                                  ? 'text-red-700'
                                  : 'text-green-700'
                              }`}>
                                {attendance.validation_notes}
                              </p>
                            </div>
                          )}

                          {/* Información de validación */}
                          {attendance.validated_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Validado: {new Date(attendance.validated_at).toLocaleString('es-PE')}
                            </p>
                          )}

                          {/* Mensaje para pendientes */}
                          {attendance.status === 'pending' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                              <p className="text-xs text-yellow-700">
                                ⏳ En espera de revisión por el administrador
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InternValidatedAttendances;
