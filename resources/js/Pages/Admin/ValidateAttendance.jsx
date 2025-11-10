import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../Services/attendanceService';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Badge } from '../../Components/Common/Badge';
import { Alert } from '../../Components/Common/Alert';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Modal } from '../../Components/Common/Modal';
import {
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '../../Utils/helpers';

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
      setAttendances(response.data || []);
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

  if (loading) {
    return <LoadingSpinner message="Cargando asistencias..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Messages */}
      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Attendances List */}
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
          {attendances.map((attendance) => (
            <Card key={attendance.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {/* User Info */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {attendance.user?.name?.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Attendance Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {attendance.user?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {attendance.user?.email}
                      </p>
                    </div>
                    <Badge type="status" value="pending">
                      Pendiente
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Date and Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ClockIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(attendance.date)}
                        </p>
                        <p>
                          {attendance.type === 'entry' ? 'Entrada' : 'Salida'} -{' '}
                          {formatTime(
                            attendance.type === 'entry'
                              ? attendance.entry_time
                              : attendance.exit_time
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium text-gray-900">Ubicación</p>
                        <p>
                          Lat: {attendance.latitude?.toFixed(6)}, Lng:{' '}
                          {attendance.longitude?.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {attendance.is_remote_entry && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-yellow-900">
                            Registro Remoto
                          </p>
                          <p className="text-sm text-yellow-800 mt-1">
                            Motivo: {attendance.remote_reason || 'No especificado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {attendance.has_delay && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ClockIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900">Retraso Detectado</p>
                          <p className="text-sm text-red-800 mt-1">
                            {attendance.delay_minutes} minutos de retraso
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openValidationModal(attendance)}
                      className="flex-1"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Revisar y Validar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Validation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !validating && setShowModal(false)}
        title="Validar Asistencia"
        size="lg"
      >
        {selectedAttendance && (
          <div className="space-y-4">
            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {selectedAttendance.user?.name}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Fecha:</p>
                  <p className="font-medium">{formatDate(selectedAttendance.date)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tipo:</p>
                  <p className="font-medium">
                    {selectedAttendance.type === 'entry' ? 'Entrada' : 'Salida'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Hora:</p>
                  <p className="font-medium">
                    {formatTime(
                      selectedAttendance.type === 'entry'
                        ? selectedAttendance.entry_time
                        : selectedAttendance.exit_time
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Horario esperado:</p>
                  <p className="font-medium">
                    {formatTime(
                      selectedAttendance.type === 'entry'
                        ? selectedAttendance.user?.entry_time
                        : selectedAttendance.user?.exit_time
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {selectedAttendance.is_remote_entry && (
              <Alert
                type="warning"
                message={`Registro remoto: ${selectedAttendance.remote_reason}`}
              />
            )}

            {selectedAttendance.has_delay && (
              <Alert
                type="error"
                message={`Retraso de ${selectedAttendance.delay_minutes} minutos`}
              />
            )}

            {/* Location Map Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Ubicación de registro</h5>
              <p className="text-sm text-blue-800">
                Lat: {selectedAttendance.latitude?.toFixed(6)}, Lng:{' '}
                {selectedAttendance.longitude?.toFixed(6)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={validating}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleValidate(selectedAttendance.id, 'rejected')}
                loading={validating}
                disabled={validating}
                className="flex-1"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleValidate(selectedAttendance.id, 'approved')}
                loading={validating}
                disabled={validating}
                className="flex-1"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
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