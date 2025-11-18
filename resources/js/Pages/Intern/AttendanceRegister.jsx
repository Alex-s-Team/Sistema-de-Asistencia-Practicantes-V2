import React, { useState, useEffect } from 'react';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Alert } from '../../Components/Common/Alert';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { useGeolocation } from '../../Hooks/useGeolocation';
import { attendanceService } from '../../Services/attendanceService';
import {
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const AttendanceRegister = () => {
  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  
  const [token, setToken] = useState('');
  const [type, setType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrToken = params.get('token');
    const regType = params.get('type');
    
    if (!qrToken) {
      setError('Token QR no válido. Por favor, escanea el código nuevamente.');
      return;
    }
    
    setToken(qrToken);
    setType(regType || 'entry');
    
    // Validar que el token esté en localStorage (generado por el sistema)
    validateToken(qrToken);
  }, []);

  const validateToken = (qrToken) => {
    const validTokens = JSON.parse(localStorage.getItem('valid_qr_tokens') || '[]');
    const tokenData = validTokens.find(t => t.token === qrToken);
    
    if (!tokenData) {
      setError('Token QR no reconocido. Este código no fue generado por el sistema.');
      return;
    }
    
    if (Date.now() > tokenData.expiresAt) {
      setError('El código QR ha expirado. Por favor, genera uno nuevo.');
      return;
    }
  };

  const handleRegister = async () => {
    if (!location) {
      setError('Esperando ubicación GPS...');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await attendanceService.markAttendance({
        qr_token: token,
        type: type,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setSuccess(true);
      setAttendanceData(response.data || response.attendance);

    } catch (err) {
      console.error('Error registering attendance:', err);
      setError(err.response?.data?.message || 'Error al registrar asistencia');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = () => {
    window.location.href = '/mark-attendance';
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Asistencia Registrada!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Tu {type === 'entry' ? 'entrada' : 'salida'} ha sido registrada exitosamente
            </p>

            {attendanceData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-600 mb-2">Detalles del registro:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-semibold">{attendanceData.entry_time || attendanceData.exit_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-semibold ${
                      attendanceData.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {attendanceData.status === 'approved' ? 'Aprobado' : 'Pendiente de Aprobación'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {attendanceData?.status === 'pending' && (
              <Alert 
                type="warning" 
                message="Tu registro está pendiente de aprobación por el administrador debido a que fue realizado desde fuera de la red de oficina."
                className="mb-6"
              />
            )}

            <Button
              variant="primary"
              onClick={handleReturn}
              className="w-full"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Regresar al Sistema
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Registro de {type === 'entry' ? 'Entrada' : 'Salida'}
          </h1>
          <p className="text-gray-600 mb-6">
            Confirma tu asistencia
          </p>

          {error && (
            <Alert type="error" message={error} className="mb-6" />
          )}

          {/* Estado de ubicación */}
          <div className={`p-4 rounded-lg border-2 mb-6 ${
            location 
              ? 'bg-green-50 border-green-200' 
              : locationLoading 
              ? 'bg-blue-50 border-blue-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <MapPinIcon className={`h-6 w-6 ${
                location ? 'text-green-600' : locationLoading ? 'text-blue-600' : 'text-red-600'
              }`} />
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">
                  {location 
                    ? '✓ Ubicación obtenida' 
                    : locationLoading 
                    ? 'Obteniendo ubicación...'
                    : '✗ Error al obtener ubicación'
                  }
                </h4>
                {location && (
                  <p className="text-xs text-gray-600 mt-1">
                    Coordenadas: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                )}
                {locationError && (
                  <p className="text-xs text-red-600 mt-1">{locationError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información que se registrará */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Datos que se registrarán:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Ubicación GPS (coordenadas)</li>
              <li>• Dirección IP de conexión</li>
              <li>• Fecha y hora exacta</li>
              <li>• Token QR de verificación</li>
            </ul>
          </div>

          {/* Advertencia */}
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 text-left">
              Si no estás en la red de oficina, tu registro requerirá aprobación del administrador.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReturn}
              disabled={submitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleRegister}
              loading={submitting}
              disabled={!location || submitting || !!error}
              className="flex-1"
            >
              {submitting ? 'Registrando...' : 'Confirmar Registro'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceRegister;