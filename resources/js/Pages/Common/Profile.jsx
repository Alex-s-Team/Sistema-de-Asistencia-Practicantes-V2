import React, { useState, useEffect } from 'react';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Input } from '../../Components/Common/Input';
import { Alert } from '../../Components/Common/Alert';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { authService } from '../../Services/authService';
import {
  UserCircleIcon,
  PencilIcon,
  KeyIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    city: '',
    emergency_contact: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      setUser(response.data);
      setProfileData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        district: response.data.district || '',
        city: response.data.city || '',
        emergency_contact: response.data.emergency_contact || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Error al cargar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await authService.updateProfile(profileData);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setEditing(false);
      await loadProfile();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar perfil'
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    try {
      await authService.changePassword(passwordData);
      setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
      setChangingPassword(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al cambiar contraseña'
      });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando perfil..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-1">
          Administra tu información personal y configuración
        </p>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary-100 mb-4">
              <UserCircleIcon className="h-20 w-20 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                user?.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user?.role === 'admin' ? 'Administrador' :
                 user?.role === 'staff' ? 'Personal' : 'Practicante'}
              </span>
            </div>

            <div className="mt-6 space-y-2 text-sm text-left">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">DNI:</span>
                <span className="font-medium text-gray-900">{user?.dni}</span>
              </div>
              {user?.role === 'intern' && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Universidad:</span>
                    <span className="font-medium text-gray-900">{user?.university || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Semestre:</span>
                    <span className="font-medium text-gray-900">{user?.semester || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Información Personal
            </h3>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                <p className="mt-1 text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user?.email || 'No registrado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                <p className="mt-1 text-gray-900">{user?.phone || 'No registrado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Dirección</label>
                <p className="mt-1 text-gray-900">{user?.address || 'No registrado'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Distrito</label>
                  <p className="mt-1 text-gray-900">{user?.district || 'No registrado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Ciudad</label>
                  <p className="mt-1 text-gray-900">{user?.city || 'No registrado'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Contacto de Emergencia</label>
                <p className="mt-1 text-gray-900">{user?.emergency_contact || 'No registrado'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Nombre Completo"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
              />
              <Input
                label="Teléfono"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
              />
              <Input
                label="Dirección"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Distrito"
                  name="district"
                  value={profileData.district}
                  onChange={handleInputChange}
                />
                <Input
                  label="Ciudad"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                />
              </div>
              <Input
                label="Contacto de Emergencia"
                name="emergency_contact"
                value={profileData.emergency_contact}
                onChange={handleInputChange}
              />
              
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    loadProfile();
                  }}
                  className="flex-1"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateProfile}
                  className="flex-1"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Cambiar Contraseña
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Actualiza tu contraseña periódicamente para mayor seguridad
            </p>
          </div>
          {!changingPassword && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangingPassword(true)}
            >
              <KeyIcon className="h-4 w-4 mr-2" />
              Cambiar
            </Button>
          )}
        </div>

        {changingPassword && (
          <div className="space-y-4">
            <Input
              label="Contraseña Actual"
              type="password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="Nueva Contraseña"
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              name="new_password_confirmation"
              value={passwordData.new_password_confirmation}
              onChange={handlePasswordChange}
              required
            />

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setChangingPassword(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                  });
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleChangePassword}
                className="flex-1"
              >
                Actualizar Contraseña
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;