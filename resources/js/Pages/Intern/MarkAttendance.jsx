import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Input } from '../../Components/Common/Input';
import { Alert } from '../../Components/Common/Alert';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Modal } from '../../Components/Common/Modal';
import { useGeolocation } from '../../Hooks/useGeolocation';
import { qrService } from '../../Services/qrService';
import { attendanceService } from '../../Services/attendanceService';
import { QRCodeSVG } from 'qrcode.react';
import { 
  MapPinIcon, 
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LinkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  
  const { location, error: locationError, loading: locationLoading, getCurrentPosition } = useGeolocation();

  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [attendanceType, setAttendanceType] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [remoteReason, setRemoteReason] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);

  // Si viene token en URL, auto-abrir modal
  useEffect(() => {
    if (tokenFromUrl) {
      handleStartAttendance('entry');
    }
  }, [tokenFromUrl]);

  useEffect(() => {
    if (showQR) {
      loadQRCode();
      const interval = setInterval(loadQRCode, 30000);
      return () => clearInterval(interval);
    }
  }, [showQR]);

  useEffect(() => {
    if (showQR && qrData) {
      const interval = setInterval(() => {
        const now = new Date();
        const expiresAt = new Date(qrData.expires_at);
        const diff = Math.floor((expiresAt - now) / 1000);
        setTimeRemaining(diff > 0 ? diff : 0);
        
        if (diff <= 0) {
          loadQRCode();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showQR, qrData]);

  const loadQRCode = async () => {
    try {
      setQrLoading(true);
      const data = await qrService.getCurrentQR();
      setQrData(data);
    } catch (err) {
      console.error('Error loading QR:', err);
      setError('Error al cargar el código QR');
    } finally {
      setQrLoading(false);
    }
  };

  const handleStartAttendance = (type) => {
    setAttendanceType(type);
    setError('');
    setSuccess('');
    getCurrentPosition();
    setShowQR(true);
  };

  const handleCopyLink = () => {
    if (qrData?.qr_url) {
      navigator.clipboard.writeText(qrData.qr_url);
      setSuccess('Link copiado al portapapeles');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleSubmitAttendance = async () => {
    if (!location) {
      setError('Debes permitir el acceso a tu ubicación');
      return;
    }

    if (!qrData) {
      setError('Código QR no disponible');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await attendanceService.markAttendance({
        qr_token: tokenFromUrl || qrData.token,
        type: attendanceType,
        latitude: location.latitude,
        longitude: location.longitude,
        remote_reason: remoteReason || null,
      });

      setSuccess(response.message);
      setShowQR(false);

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrar asistencia';
      setError(errorMsg);
      
      // Si requiere justificación remota
      if (err.response?.data?.requires_remote_reason && !remoteReason) {
        setShowRemoteModal(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRemote = async () => {
    if (!remoteReason.trim()) {
      setError('Debes especificar el motivo del registro remoto');
      return;
    }
    setShowRemoteModal(false);
    await handleSubmitAttendance();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marcar Asistencia
          </h1>
          <p className="text-gray-600">
            Selecciona si deseas marcar tu entrada o salida
          </p>
        </div>
      </Card>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      {!showQR && !tokenFromUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <ClockIcon className="h-20 w-20 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Marcar Entrada
            </h3>
            <p className="text-gray-600 mb-6">
              Registra tu llegada a la oficina
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleStartAttendance('entry')}
              className="w-full"
            >
              Marcar Entrada
            </Button>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CheckCircleIcon className="h-20 w-20 text-secondary-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Marcar Salida
            </h3>
            <p className="text-gray-600 mb-6">
              Registra tu salida de la oficina
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleStartAttendance('exit')}
              className="w-full"
            >
              Marcar Salida
            </Button>
          </Card>
        </div>
      )}

      {showQR && (
        <Card>
          <div className="space-y-6">
            <div className={`p-4 rounded-lg border-2 ${
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
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {location 
                      ? '✓ Ubicación obtenida' 
                      : locationLoading 
                      ? 'Obteniendo ubicación...'
                      : '✗ Error al obtener ubicación'
                    }
                  </h4>
                  {location && (
                    <p className="text-sm text-gray-600">
                      Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                    </p>
                  )}
                  {locationError && (
                    <p className="text-sm text-red-600">{locationError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-block p-6 bg-white rounded-lg shadow-lg">
                {qrLoading ? (
                  <LoadingSpinner message="Cargando código QR..." />
                ) : qrData ? (
                  <>
                    <QRCodeSVG
                      value={qrData.qr_url}
                      size={300}
                      level="H"
                      includeMargin
                    />
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                      <p className="text-sm font-medium text-gray-700">
                        Código válido por: {timeRemaining}s
                      </p>
                      <div className="mt-2 w-full bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${(timeRemaining / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="w-full"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Copiar Link del QR
                      </Button>
                      <p className="text-xs text-gray-500">
                        Si tu celular no escanea, copia el link
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadQRCode}
                      className="w-full mt-2"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Renovar QR
                    </Button>
                  </>
                ) : (
                  <div className="text-gray-500">
                    <QrCodeIcon className="h-20 w-20 mx-auto mb-2" />
                    <p>No se pudo cargar el QR</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Instrucciones:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Asegúrate de estar en la oficina o explica el motivo si estás en otro lugar</li>
                <li>Escanea el QR con tu celular o copia el link</li>
                <li>El código QR se renueva cada 30 segundos por seguridad</li>
                <li>Presiona "Confirmar {attendanceType === 'entry' ? 'Entrada' : 'Salida'}" cuando estés listo</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowQR(false);
                  setAttendanceType(null);
                  setRemoteReason('');
                }}
                disabled={submitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitAttendance}
                loading={submitting}
                disabled={!location || !qrData || submitting}
                className="flex-1"
              >
                Confirmar {attendanceType === 'entry' ? 'Entrada' : 'Salida'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showRemoteModal}
        onClose={() => setShowRemoteModal(false)}
        title="Registro Remoto"
        size="md"
      >
        <div className="space-y-4">
          <Alert
            type="warning"
            message="Has iniciado sesión desde fuera de la red de la oficina. Por favor, justifica el motivo del registro remoto."
          />

          <Input
            label="Motivo del registro remoto"
            placeholder="Ej: Cita médica, trabajo desde casa autorizado, etc."
            value={remoteReason}
            onChange={(e) => setRemoteReason(e.target.value)}
            required
          />

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowRemoteModal(false);
                setRemoteReason('');
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitRemote}
              disabled={!remoteReason.trim()}
              className="flex-1"
            >
              Confirmar Registro
            </Button>
          </div>
        </div>
      </Modal>

      <Card>
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Importante</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Solo puedes marcar asistencia una vez por día (entrada y salida)</li>
              <li>• Los registros fuera de la red requieren aprobación del supervisor</li>
              <li>• Si llegas tarde, el sistema calculará automáticamente el retraso</li>
              <li>• Puedes justificar ausencias y retrasos desde la sección de justificaciones</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MarkAttendance;