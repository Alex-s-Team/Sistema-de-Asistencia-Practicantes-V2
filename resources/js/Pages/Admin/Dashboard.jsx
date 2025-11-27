import React, { useState, useEffect } from 'react';
import { Card } from '../../Components/Common/Card';
import { Badge } from '../../Components/Common/Badge';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Alert } from '../../Components/Common/Alert';
import { attendanceService } from '../../Services/attendanceService';
import { userService } from '../../Services/userService';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAttendances, setRecentAttendances] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsData, attendancesData, internsData] = await Promise.all([
        attendanceService.getStats(),
        attendanceService.getAttendances({
          status: 'approved',
          start_date: selectedDate,
          end_date: selectedDate
        }),
        userService.getInterns()
      ]);

      setStats(statsData);

      // Asegurarnos de que attendancesData.data existe
      const attendances = attendancesData?.data || attendancesData || [];
      setRecentAttendances(Array.isArray(attendances) ? attendances : []);

      const internsArray = internsData?.data || internsData || [];
      setInterns(Array.isArray(internsArray) ? internsArray : []);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setMessage({
        type: 'error',
        text: 'Error al cargar datos del dashboard'
      });
      setRecentAttendances([]);
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcular horas trabajadas
  const calculateWorkedHours = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) return null;

    const [entryH, entryM] = entryTime.split(':').map(Number);
    const [exitH, exitM] = exitTime.split(':').map(Number);

    const entryMinutes = entryH * 60 + entryM;
    const exitMinutes = exitH * 60 + exitM;

    let diffMinutes = exitMinutes - entryMinutes;

    // Si la salida es al día siguiente
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return { hours, minutes, total: diffMinutes };
  };

  const formatTime = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-1">Vista general del sistema de asistencias</p>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Practicantes Activos</p>
              <p className="text-3xl font-bold mt-1">{interns.length}</p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Asistencias Hoy</p>
              <p className="text-3xl font-bold mt-1">{recentAttendances.length}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pendientes</p>
              <p className="text-3xl font-bold mt-1">{stats?.pending_validations || 0}</p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Este Mes</p>
              <p className="text-3xl font-bold mt-1">{stats?.approved_attendances || 0}</p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-purple-200" />
          </div>
        </Card>
      </div>

      {/* Selector de Fecha */}
      <Card>
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-6 w-6 text-gray-400" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ver asistencias del día:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Mostrando:</p>
            <p className="font-semibold text-gray-900">{formatDate(selectedDate)}</p>
          </div>
        </div>
      </Card>

      {/* Tabla de Asistencias */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Asistencias del Día
          </h2>
          <Badge type="info">{recentAttendances.length} registros</Badge>
        </div>

        {recentAttendances.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay asistencias registradas para este día</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Practicante
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Hora Entrada
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Hora Salida
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Horas Trabajadas
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Ubicación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentAttendances.map((attendance) => {
                  const workedHours = calculateWorkedHours(
                    attendance.entry_time,
                    attendance.exit_time
                  );

                  return (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      {/* Practicante */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary-600">
                              {attendance.user?.name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {attendance.user?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {attendance.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Hora Entrada */}
                      <td className="px-4 py-4 text-center">
                        {attendance.entry_time ? (
                          <div>
                            <p className="font-semibold text-green-600 text-lg">
                              {formatTime(attendance.entry_time)}
                            </p>
                            {attendance.has_delay && (
                              <Badge type="warning" className="mt-1">
                                +{attendance.delay_minutes} min
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin registro</span>
                        )}
                      </td>

                      {/* Hora Salida */}
                      <td className="px-4 py-4 text-center">
                        {attendance.exit_time ? (
                          <p className="font-semibold text-blue-600 text-lg">
                            {formatTime(attendance.exit_time)}
                          </p>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">
                              No registró salida
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Horas Trabajadas */}
                      <td className="px-4 py-4 text-center">
                        {workedHours ? (
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {workedHours.hours}h {workedHours.minutes}m
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {workedHours.total} minutos
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Badge type="status" value={attendance.status}>
                            {attendance.status === 'approved' ? 'Aprobado' :
                             attendance.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                          </Badge>
                          {attendance.is_remote_entry && (
                            <Badge type="warning">Remoto</Badge>
                          )}
                        </div>
                      </td>

                      {/* Ubicación */}
                      <td className="px-4 py-4 text-center">
                        {attendance.distance_from_office ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {Math.round(attendance.distance_from_office)}m
                            </p>
                            <p className="text-xs text-gray-500">de oficina</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
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

export default AdminDashboard;
