import React, { useState, useEffect } from 'react';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Badge } from '../../Components/Common/Badge';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Alert } from '../../Components/Common/Alert';
import { userService } from '../../Services/userService';
import { useAuth } from '../../Context/AuthContext';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  XMarkIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../Utils/helpers';

const UserProfile = ({ userId, onClose, showResetPassword = false }) => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getUser(userId);
      setUser(response.data);
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Error al cargar información del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(`¿Estás seguro de restablecer la contraseña de ${user.name}? La nueva contraseña será su DNI (${user.dni}).`)) {
      return;
    }

    try {
      setResettingPassword(true);
      await userService.resetPassword(user.id);
      setSuccess(`Contraseña restablecida correctamente. La nueva contraseña es: ${user.dni}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.response?.data?.message || 'Error al restablecer contraseña');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirm(`¿Estás seguro de ${user.is_active ? 'desactivar' : 'activar'} a ${user.name}?`)) {
      return;
    }

    try {
      await userService.updateUser(user.id, { is_active: !user.is_active });
      setUser(prev => ({ ...prev, is_active: !prev.is_active }));
      setSuccess(`Usuario ${user.is_active ? 'desactivado' : 'activado'} correctamente`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Administrador', color: 'red' },
      staff: { label: 'Personal', color: 'blue' },
      intern: { label: 'Practicante', color: 'green' },
    };
    return badges[role] || badges.intern;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">No se pudo cargar la información del usuario</p>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user.role);
  const isAdmin = currentUser?.role === 'admin';
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h2>
        <Button variant="outline" onClick={onClose}>
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 mb-4">
              <UserCircleIcon className="h-16 w-16 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-600">{user.email || 'Sin email'}</p>
            
            <div className="mt-4">
              <Badge type="role" value={user.role}>
                {roleBadge.label}
              </Badge>
            </div>
            
            <div className="mt-2">
              <Badge type="status" value={user.is_active ? 'success' : 'error'}>
                {user.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">DNI:</span>
              <span className="font-medium text-gray-900">{user.dni}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Género:</span>
              <span className="font-medium text-gray-900">{user.gender === 'masculino' ? 'Masculino' : 'Femenino'}</span>
            </div>
            {user.birth_date && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Fecha de Nacimiento:</span>
                <span className="font-medium text-gray-900">{formatDate(user.birth_date)}</span>
              </div>
            )}
            {user.age && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Edad:</span>
                <span className="font-medium text-gray-900">{user.age} años</span>
              </div>
            )}
          </div>

          {/* Acciones para administradores */}
          {isAdmin && !isOwnProfile && (
            <div className="mt-6 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleToggleStatus}
              >
                {user.is_active ? 'Desactivar Usuario' : 'Activar Usuario'}
              </Button>
              
              {showResetPassword && (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={handleResetPassword}
                  loading={resettingPassword}
                >
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Restablecer Contraseña
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Información Detallada */}
        <Card className="lg:col-span-2">
          <div className="space-y-6">
            {/* Información de Contacto */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user.email || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium text-gray-900">{user.phone || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium text-gray-900">{user.address || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Distrito</p>
                    <p className="font-medium text-gray-900">{user.district || 'No registrado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Prácticas (solo para practicantes) */}
            {user.role === 'intern' && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Prácticas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Universidad</p>
                      <p className="font-medium text-gray-900">{user.university || 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Semestre</p>
                      <p className="font-medium text-gray-900">{user.semester || 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Inicio</p>
                      <p className="font-medium text-gray-900">
                        {user.start_date ? formatDate(user.start_date) : 'No registrado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Fin</p>
                      <p className="font-medium text-gray-900">
                        {user.end_date ? formatDate(user.end_date) : 'No registrado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Horario</p>
                      <p className="font-medium text-gray-900">
                        {user.entry_time && user.exit_time 
                          ? `${user.entry_time} - ${user.exit_time}`
                          : 'No registrado'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información de Cargo (solo para staff) */}
            {user.role === 'staff' && user.position && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h4>
                <div>
                  <p className="text-sm text-gray-600">Cargo</p>
                  <p className="font-medium text-gray-900">{user.position}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;