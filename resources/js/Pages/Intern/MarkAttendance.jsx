import React, { useState, useEffect } from 'react';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Alert } from '../../Components/Common/Alert';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';
import { attendanceService } from '../../Services/attendanceService';
import { 
  QrCodeIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MarkAttendance = () => {
  const [qrToken, setQrToken] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkTodayAttendance();
    generateQRToken();
    const interval = setInterval(generateQRToken, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (qrToken) {
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((qrToken.expiresAt - now) / 1000);
        setTimeRemaining(diff > 0 ? diff : 0);
        
        if (diff <= 0) {
          generateQRToken();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [qrToken]);

  const checkTodayAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getTodayAttendance();
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Error checking attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRToken = () => {
    const token = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + 30000;
    
    setQrToken({
      token: token,
      expiresAt: expiresAt
    });

    // Guardar en localStorage para validación
    localStorage.setItem('valid_qr_tokens', JSON.stringify([
      ...(JSON.parse(localStorage.getItem('valid_qr_tokens') || '[]')),
      { token, expiresAt }
    ].slice(-10))); // Mantener últimos 10 tokens
  };

  const getQRUrl = () => {
    return `${window.location.origin}/attendance-register?token=${qrToken?.token}`;
  };

  const handleDirectRegister = (type) => {
    window.location.href = `/attendance-register?token=${qrToken?.token}&type=${type}`;
  };

  const canRegisterEntry = () => {
    return !todayAttendance?.entry_time;
  };

  const canRegisterExit = () => {
    if (!todayAttendance?.entry_time) return false;
    if (todayAttendance?.exit_time) return false;
    
    // Verificar si ya es casi hora de salida (12:50 PM = 12.83 horas)
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    return currentHour >= 12.83; // 12:50 PM
  };

  const getExitButtonOpacity = () => {
    if (!todayAttendance?.entry_time || todayAttendance?.exit_time) {
      return 'opacity-40 cursor-not-allowed';
    }
    
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    
    if (currentHour >= 12.83) {
      return 'opacity-100';
    }
    return 'opacity-60';
  };

  const getAttendanceStatus = (attendance) => {
    if (!attendance) return null;
    
    switch(attendance.status) {
      case 'approved':
        return { color: 'green', text: 'Aprobado', icon: '✓' };
      case 'rejected':
        return { color: 'red', text: 'Rechazado', icon: '✗' };
      case 'pending':
        return { color: 'yellow', text: 'Pendiente', icon: '⏳' };
      default:
        return { color: 'gray', text: 'Desconocido', icon: '?' };
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando información..." />;
  }

  const entryStatus = todayAttendance?.entry_time ? getAttendanceStatus(todayAttendance) : null;
  const exitStatus = todayAttendance?.exit_time ? getAttendanceStatus(todayAttendance) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registro de Asistencia
          </h1>
          <p className="text-gray-600">
            Escanea el código QR o haz clic en el botón para registrar tu asistencia
          </p>
        </div>
      </Card>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      {/* Alerta de aprobación pendiente */}
      {todayAttendance?.status === 'pending' && (
        <Alert 
          type="warning" 
          message="⏳ Tu asistencia de hoy está pendiente de aprobación por el administrador. Recibirás una notificación cuando sea revisada."
        />
      )}

      {todayAttendance?.status === 'rejected' && (
        <Alert 
          type="error" 
          message="✗ Tu asistencia fue rechazada. Contacta al administrador para más información."
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Izquierdo - QR Code */}
        <Card>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              <DevicePhoneMobileIcon className="h-6 w-6 inline mr-2" />
              Escanea con tu Celular
            </h3>
            
            <div className="inline-block p-6 bg-white rounded-2xl shadow-2xl">
              {qrToken ? (
                <>
                  <QRCodeSVG
                    value={getQRUrl()}
                    size={280}
                    level="H"
                    includeMargin
                  />
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <ClockIcon className="h-5 w-5 text-gray-700" />
                      <p className="text-sm font-semibold text-gray-900">
                        Válido por: {timeRemaining}s
                      </p>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          timeRemaining > 15 ? 'bg-green-500' : 
                          timeRemaining > 5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(timeRemaining / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  <QrCodeIcon className="h-32 w-32 mx-auto mb-4" />
                  <p>Generando código QR...</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={generateQRToken}
              className="mt-4"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Renovar QR
            </Button>

            <div className="mt-6 text-left bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-semibold mb-2">
                Instrucciones para celular:
              </p>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Abre la cámara de tu celular</li>
                <li>Apunta al código QR</li>
                <li>Haz clic en el enlace que aparece</li>
                <li>Se abrirá una página para registrar tu asistencia</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Panel Derecho - Botones Directos */}
        <Card>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              <ComputerDesktopIcon className="h-6 w-6 inline mr-2" />
              Registro desde Computadora
            </h3>

            <div className="space-y-4">
              {/* Estado actual */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Estado de hoy:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Entrada:</span>
                    {todayAttendance?.entry_time ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-${entryStatus.color}-600 font-semibold flex items-center gap-1`}>
                          <CheckCircleIcon className="h-4 w-4" />
                          {todayAttendance.entry_time}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full bg-${entryStatus.color}-100 text-${entryStatus.color}-700`}>
                          {entryStatus.icon} {entryStatus.text}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No registrada</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Salida:</span>
                    {todayAttendance?.exit_time ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-${exitStatus.color}-600 font-semibold flex items-center gap-1`}>
                          <CheckCircleIcon className="h-4 w-4" />
                          {todayAttendance.exit_time}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full bg-${exitStatus.color}-100 text-${exitStatus.color}-700`}>
                          {exitStatus.icon} {exitStatus.text}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No registrada</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Entrada */}
              <div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleDirectRegister('entry')}
                  disabled={!canRegisterEntry()}
                  className="w-full"
                >
                  <ClockIcon className="h-6 w-6 mr-2" />
                  {todayAttendance?.entry_time ? 'Entrada Registrada' : 'Registrar Entrada'}
                </Button>
                {todayAttendance?.entry_time && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Ya registraste tu entrada hoy
                  </p>
                )}
              </div>

              {/* Botón de Salida */}
              <div>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleDirectRegister('exit')}
                  disabled={!canRegisterExit()}
                  className={`w-full ${getExitButtonOpacity()}`}
                >
                  <CheckCircleIcon className="h-6 w-6 mr-2" />
                  {todayAttendance?.exit_time ? 'Salida Registrada' : 'Registrar Salida'}
                </Button>
                {!todayAttendance?.entry_time && (
                  <p className="text-xs text-gray-500 mt-1">
                    Debes registrar tu entrada primero
                  </p>
                )}
                {todayAttendance?.entry_time && !todayAttendance?.exit_time && !canRegisterExit() && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Disponible desde las 12:50 PM
                  </p>
                )}
                {todayAttendance?.exit_time && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Ya registraste tu salida hoy
                  </p>
                )}
              </div>

              <div className="text-left bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-purple-900 font-semibold mb-2">
                  Instrucciones para computadora:
                </p>
                <ol className="text-xs text-purple-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en el botón correspondiente (Entrada/Salida)</li>
                  <li>Se abrirá una nueva página para confirmar</li>
                  <li>El sistema detectará tu ubicación e IP automáticamente</li>
                  <li>Confirma el registro y regresa aquí</li>
                </ol>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Información de Seguridad */}
      <Card>
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Sistema de Seguridad Activo</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Ubicación GPS:</strong> Se registrará tu ubicación exacta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Dirección IP:</strong> Se registrará tu IP de conexión</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Token QR:</strong> Único y temporal (30 segundos)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">⚠</span>
                <span><strong>Aprobación:</strong> Todos los registros requieren aprobación del administrador</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MarkAttendance;