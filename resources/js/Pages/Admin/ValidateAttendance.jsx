import React, { useState, useEffect } from 'react';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Badge } from '../../Components/Common/Badge';
import { Alert } from '../../Components/Common/Alert';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Modal } from '../../Components/Common/Modal';
import { attendanceService } from '../../Services/attendanceService';
import {
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const ValidateAttendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [validating, setValidating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationNotes, setValidationNotes] = useState('');

  useEffect(() => {
    loadPendingAttendances();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadPendingAttendances, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingAttendances = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getPending();
      const data = Array.isArray(response) ? response : response.data || [];

      console.log('Asistencias pendientes cargadas:', data);
      setAttendances(data);
    } catch (error) {
      console.error('Error loading attendances:', error);
      setMessage({ type: 'error', text: 'Error al cargar las asistencias' });
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (attendanceId, status, respondPrivately = false) => {
    try {
      setValidating(true);
      await attendanceService.validate(attendanceId, {
        status,
        validation_notes: validationNotes
      });

      setMessage({
        type: 'success',
        text: `Asistencia ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`,
      });

      setShowModal(false);
      setSelectedAttendance(null);
      setValidationNotes('');
      await loadPendingAttendances();

      // Si eligió responder en privado, redirigir al chat
      if (respondPrivately && selectedAttendance?.user?.id) {
        setTimeout(() => {
          window.location.href = `/chat?user=${selectedAttendance.user.id}`;
        }, 1000);
      }
    } catch (error) {
      console.error('Error validating:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al validar asistencia',
      });
    } finally {
      setValidating(false);
    }
  };

  const openValidationModal = (attendance) => {
    setSelectedAttendance(attendance);
    setValidationNotes('');
    setShowModal(true);
  };

  const isValidNetwork = (ip) => {
    if (!ip) return false;
    const parts = ip.split('.');
    return parts[0] === '192' && parts[1] === '168' && parts[2] === '50';
  };

  const isQRValid = (token) => {
    if (!token) return false;
    return token.startsWith('QR-') && token.split('-').length === 3;
  };

  const getDistanceStatus = (distance) => {
    if (!distance) return { color: 'gray', text: 'Sin datos', status: 'unknown' };
    const distanceNum = parseFloat(distance);
    if (distanceNum <= 500) {
      return { color: 'green', text: 'Dentro de oficina', status: 'good' };
    } else if (distanceNum <= 1000) {
      return { color: 'yellow', text: 'Cerca de oficina', status: 'warning' };
    } else {
      return { color: 'red', text: 'Lejos de oficina', status: 'danger' };
    }
  };

  const openMapLocation = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Calcular horas trabajadas
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

  const parseCoordinate = (coord) => {
    if (coord === null || coord === undefined) return null;
    const num = parseFloat(coord);
    return isNaN(num) ? null : num;
  };

  const formatCoordinate = (coord) => {
    const num = parseCoordinate(coord);
    return num !== null ? num.toFixed(6) : 'N/A';
  };

  if (loading) {
    return <LoadingSpinner message="Cargando asistencias..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Validar Asistencias</h1>
          <p className="text-gray-600 mt-1">
            Revisa y aprueba las asistencias pendientes
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">{attendances.length}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPendingAttendances}
            className="mt-2"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {attendances.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Todo al día!
            </h3>
            <p className="text-gray-600">
              No hay asistencias pendientes de validación
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {attendances.map((attendance) => {
            const networkValidEntry = isValidNetwork(attendance.entry_ip);
            const networkValidExit = isValidNetwork(attendance.exit_ip);
            const qrValid = isQRValid(attendance.qr_token);
            const distanceStatusEntry = getDistanceStatus(attendance.distance_from_office);
            const hasEntry = !!attendance.entry_time;
            const hasExit = !!attendance.exit_time;
            const workedHours = calculateWorkedHours(attendance.entry_time, attendance.exit_time);

            const latitudeEntry = parseCoordinate(attendance.entry_latitude);
            const longitudeEntry = parseCoordinate(attendance.entry_longitude);
            const latitudeExit = parseCoordinate(attendance.exit_latitude);
            const longitudeExit = parseCoordinate(attendance.exit_longitude);

            return (
              <Card key={attendance.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-600">
                          {attendance.user?.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {attendance.user?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {attendance.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge type="status" value="pending">
                        Pendiente
                      </Badge>
                      <p className="text-sm text-gray-600">
                        {formatDate(attendance.date)}
                      </p>
                    </div>
                  </div>

                  {/* Entrada y Salida en Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ENTRADA */}
                    <div className={`border-2 rounded-lg p-4 ${
                      hasEntry ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <ClockIcon className="h-5 w-5 text-green-600" />
                        <h4 className="font-bold text-green-800 uppercase">Entrada</h4>
                      </div>

                      {hasEntry ? (
                        <div className="space-y-3">
                          {/* Hora */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Hora de entrada:</p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatTime(attendance.entry_time)}
                            </p>
                            {attendance.has_delay && (
                              <Badge type="warning" className="mt-1">
                                Retardo: {attendance.delay_minutes}min
                              </Badge>
                            )}
                          </div>

                          {/* Ubicación */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Ubicación GPS:</p>
                            <p className="text-xs text-gray-700 font-mono">
                              {formatCoordinate(attendance.entry_latitude)},
                              {formatCoordinate(attendance.entry_longitude)}
                            </p>
                            {attendance.distance_from_office && (
                              <p className={`text-xs font-semibold mt-1 text-${distanceStatusEntry.color}-600`}>
                                📍 {Math.round(parseFloat(attendance.distance_from_office))}m - {distanceStatusEntry.text}
                              </p>
                            )}
                            {latitudeEntry !== null && longitudeEntry !== null && (
                              <button
                                onClick={() => openMapLocation(latitudeEntry, longitudeEntry)}
                                className="text-xs text-blue-600 hover:underline mt-1"
                              >
                                🗺️ Ver en Google Maps →
                              </button>
                            )}
                          </div>

                          {/* IP y Red */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Conexión:</p>
                            <p className="text-xs text-gray-700 font-mono">
                              {attendance.entry_ip}
                            </p>
                            <div className="mt-1">
                              {networkValidEntry ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
                                  <CheckCircleIcon className="h-3 w-3" />
                                  Red de Oficina
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                                  <ExclamationTriangleIcon className="h-3 w-3" />
                                  Red Externa
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Registro */}
                          <div>
                            <p className="text-xs text-gray-500">
                              Registrado: {new Date(attendance.created_at).toLocaleString('es-PE')}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-400">Sin registro de entrada</p>
                        </div>
                      )}
                    </div>

                    {/* SALIDA */}
                    <div className={`border-2 rounded-lg p-4 ${
                      hasExit ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                        <h4 className="font-bold text-blue-800 uppercase">Salida</h4>
                      </div>

                      {hasExit ? (
                        <div className="space-y-3">
                          {/* Hora */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Hora de salida:</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {formatTime(attendance.exit_time)}
                            </p>
                          </div>

                          {/* Ubicación */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Ubicación GPS:</p>
                            <p className="text-xs text-gray-700 font-mono">
                              {formatCoordinate(attendance.exit_latitude)},
                              {formatCoordinate(attendance.exit_longitude)}
                            </p>
                            {latitudeExit !== null && longitudeExit !== null && (
                              <button
                                onClick={() => openMapLocation(latitudeExit, longitudeExit)}
                                className="text-xs text-blue-600 hover:underline mt-1"
                              >
                                🗺️ Ver en Google Maps →
                              </button>
                            )}
                          </div>

                          {/* IP y Red */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Conexión:</p>
                            <p className="text-xs text-gray-700 font-mono">
                              {attendance.exit_ip}
                            </p>
                            <div className="mt-1">
                              {networkValidExit ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
                                  <CheckCircleIcon className="h-3 w-3" />
                                  Red de Oficina
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                                  <ExclamationTriangleIcon className="h-3 w-3" />
                                  Red Externa
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                              No registró salida
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Horas Trabajadas */}
                  {workedHours && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ArrowRightIcon className="h-6 w-6 text-purple-600" />
                          <div>
                            <p className="text-sm text-purple-700 font-medium">Total Horas Trabajadas</p>
                            <p className="text-xs text-purple-600">Entrada → Salida</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-purple-700">
                            {workedHours.hours}h {workedHours.minutes}m
                          </p>
                          <p className="text-xs text-purple-600">{workedHours.total} minutos</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Token QR */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                    <QrCodeIcon className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Token QR</p>
                      <p className="text-xs text-gray-600 font-mono">
                        {attendance.qr_token || 'No disponible'}
                      </p>
                    </div>
                    <div>
                      {qrValid ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <ShieldCheckIcon className="h-5 w-5" />
                          <span className="text-sm font-semibold">✓ Verificado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <ShieldExclamationIcon className="h-5 w-5" />
                          <span className="text-sm font-semibold">⚠ Sospechoso</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Razón Remota */}
                  {attendance.remote_reason && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-yellow-900 text-sm">
                            Registro Remoto
                          </p>
                          <p className="text-sm text-yellow-800 mt-1">
                            {attendance.remote_reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alertas de Seguridad */}
                  {((!networkValidEntry && hasEntry) || (!networkValidExit && hasExit) || !qrValid || distanceStatusEntry.status === 'danger') && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-900 text-sm mb-2">
                            ⚠️ Alertas de Seguridad:
                          </p>
                          <ul className="text-xs text-red-800 space-y-1">
                            {distanceStatusEntry.status === 'danger' && attendance.distance_from_office && (
                              <li>• Usuario está a {Math.round(parseFloat(attendance.distance_from_office))}m de la oficina (muy lejos)</li>
                            )}
                            {!networkValidEntry && hasEntry && <li>• Entrada desde red externa (no es red de oficina)</li>}
                            {!networkValidExit && hasExit && <li>• Salida desde red externa (no es red de oficina)</li>}
                            {!qrValid && <li>• Token QR no reconocido o inválido</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones de Acción */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => openValidationModal(attendance)}
                      disabled={validating}
                      className="flex-1"
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleValidate(attendance.id, 'rejected')}
                      disabled={validating}
                      className="flex-1"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleValidate(attendance.id, 'approved')}
                      disabled={validating}
                      className="flex-1"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Detalles */}
      <Modal
        isOpen={showModal}
        onClose={() => !validating && setShowModal(false)}
        title="Revisar Asistencia"
        size="lg"
      >
        {selectedAttendance && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Información Completa</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Usuario:</strong> {selectedAttendance.user?.name}</p>
                <p><strong>Email:</strong> {selectedAttendance.user?.email}</p>
                <p><strong>Fecha:</strong> {formatDate(selectedAttendance.date)}</p>

                {selectedAttendance.entry_time && (
                  <>
                    <p><strong>Hora Entrada:</strong> {formatTime(selectedAttendance.entry_time)}</p>
                    <p><strong>IP Entrada:</strong> {selectedAttendance.entry_ip}</p>
                  </>
                )}

                {selectedAttendance.exit_time && (
                  <>
                    <p><strong>Hora Salida:</strong> {formatTime(selectedAttendance.exit_time)}</p>
                    <p><strong>IP Salida:</strong> {selectedAttendance.exit_ip}</p>
                  </>
                )}

                {selectedAttendance.distance_from_office && (
                  <p><strong>Distancia:</strong> {Math.round(parseFloat(selectedAttendance.distance_from_office))}m de la oficina</p>
                )}
                <p><strong>Token QR:</strong> {selectedAttendance.qr_token}</p>
                {selectedAttendance.has_delay && (
                  <p className="text-orange-600"><strong>Retraso:</strong> {selectedAttendance.delay_minutes} minutos</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota de validación (opcional)
              </label>
              <textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Agrega una nota si es necesario..."
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={validating}
                className="flex-1"
              >
                Cerrar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleValidate(selectedAttendance.id, 'rejected', false)}
                loading={validating}
                disabled={validating}
                className="flex-1"
              >
                Rechazar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleValidate(selectedAttendance.id, 'approved', false)}
                loading={validating}
                disabled={validating}
                className="flex-1"
              >
                Aprobar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ValidateAttendance;
