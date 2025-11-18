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
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

const ValidateAttendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [validating, setValidating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPendingAttendances();
  }, []);

  const loadPendingAttendances = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getPending();
      setAttendances(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Error loading attendances:', error);
      setMessage({ type: 'error', text: 'Error al cargar las asistencias' });
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (attendanceId, status) => {
    try {
      setValidating(true);
      await attendanceService.validate(attendanceId, { status });
      
      setMessage({
        type: 'success',
        text: `Asistencia ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`,
      });
      
      setShowModal(false);
      setSelectedAttendance(null);
      await loadPendingAttendances();
    } catch (error) {
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
    setShowModal(true);
  };

  const isValidNetwork = (ip) => {
    // Verificar si la IP está en el rango 192.168.50.0/24
    if (!ip) return false;
    const parts = ip.split('.');
    return parts[0] === '192' && parts[1] === '168' && parts[2] === '50';
  };

  const isQRValid = (token) => {
    if (!token) return false;
    // Verificar formato del token (QR-timestamp-random)
    return token.startsWith('QR-') && token.split('-').length === 3;
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
            const networkValid = isValidNetwork(attendance.entry_ip || attendance.exit_ip);
            const qrValid = isQRValid(attendance.qr_token);
            
            return (
              <Card key={attendance.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header con usuario */}
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
                    <Badge type="status" value="pending">
                      Pendiente
                    </Badge>
                  </div>

                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(attendance.date)}
                        </p>
                        <p className="text-gray-600">
                          {attendance.entry_time ? `Entrada: ${attendance.entry_time}` : `Salida: ${attendance.exit_time}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Ubicación GPS</p>
                        <p className="text-xs text-gray-600">
                          {attendance.entry_latitude || attendance.exit_latitude}, {attendance.entry_longitude || attendance.exit_longitude}
                        </p>
                        <button
                          onClick={() => openMapLocation(
                            attendance.entry_latitude || attendance.exit_latitude,
                            attendance.entry_longitude || attendance.exit_longitude
                          )}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Ver en el mapa →
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Dirección IP</p>
                        <p className="text-xs text-gray-600">
                          {attendance.entry_ip || attendance.exit_ip}
                        </p>
                        <div className="mt-1">
                          {networkValid ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <CheckCircleIcon className="h-3 w-3" />
                              Red de oficina
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600">
                              <ExclamationTriangleIcon className="h-3 w-3" />
                              Red externa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verificación de QR */}
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
                          <span className="text-sm font-semibold">QR Verificado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <ShieldExclamationIcon className="h-5 w-5" />
                          <span className="text-sm font-semibold">QR Falsificado</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Razón remota si existe */}
                  {(attendance.remote_entry_reason || attendance.remote_exit_reason) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-yellow-900 text-sm">
                            Registro Remoto
                          </p>
                          <p className="text-sm text-yellow-800 mt-1">
                            Motivo: {attendance.remote_entry_reason || attendance.remote_exit_reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alertas de seguridad */}
                  {(!networkValid || !qrValid) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-900 text-sm mb-2">
                            Alertas de Seguridad:
                          </p>
                          <ul className="text-xs text-red-800 space-y-1">
                            {!networkValid && (
                              <li>• Registro desde red externa (no autorizada)</li>
                            )}
                            {!qrValid && (
                              <li>• Token QR no reconocido por el sistema</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
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

      {/* Modal de detalles */}
      <Modal
        isOpen={showModal}
        onClose={() => !validating && setShowModal(false)}
        title="Detalles de Asistencia"
        size="lg"
      >
        {selectedAttendance && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Información Completa</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Usuario:</strong> {selectedAttendance.user?.name}</p>
                <p><strong>Fecha:</strong> {formatDate(selectedAttendance.date)}</p>
                <p><strong>Tipo:</strong> {selectedAttendance.entry_time ? 'Entrada' : 'Salida'}</p>
                <p><strong>Hora:</strong> {selectedAttendance.entry_time || selectedAttendance.exit_time}</p>
                <p><strong>IP:</strong> {selectedAttendance.entry_ip || selectedAttendance.exit_ip}</p>
                <p><strong>Coordenadas:</strong> {selectedAttendance.entry_latitude || selectedAttendance.exit_latitude}, {selectedAttendance.entry_longitude || selectedAttendance.exit_longitude}</p>
                <p><strong>Token QR:</strong> {selectedAttendance.qr_token}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
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
                onClick={() => handleValidate(selectedAttendance.id, 'rejected')}
                loading={validating}
                disabled={validating}
                className="flex-1"
              >
                Rechazar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleValidate(selectedAttendance.id, 'approved')}
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