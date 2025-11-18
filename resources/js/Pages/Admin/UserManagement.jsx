import React, { useState, useEffect } from 'react';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Input } from '../../Components/Common/Input';
import { Select } from '../../Components/Common/Select';
import { Badge } from '../../Components/Common/Badge';
import { Modal } from '../../Components/Common/Modal';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Alert } from '../../Components/Common/Alert';
import { userService } from '../../Services/userService';
import { useRealTimeSync } from '../../Hooks/useRealTimeSync';
import { useAuth } from '../../Context/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  EyeIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    email: '',
    password: '',
    role: 'intern',
    gender: 'masculino',
    birth_date: '',
    phone: '',
    emergency_contact: '',
    address: '',
    district: '',
    city: '',
    university: '',
    semester: '',
    position: '',
    start_date: '',
    end_date: '',
    entry_time: '08:00',
    exit_time: '13:00',
  });

  // 🔥 SINCRONIZACIÓN EN TIEMPO REAL
  useRealTimeSync('user', (event) => {
    console.log('User update received:', event);
    
    if (event.action === 'created') {
      // Agregar nuevo usuario a la lista
      setUsers(prev => [...prev, event.data]);
      setSuccess('Nuevo usuario agregado al sistema');
      setTimeout(() => setSuccess(''), 3000);
    } else if (event.action === 'updated') {
      // Actualizar usuario existente
      setUsers(prev => prev.map(u => 
        u.id === event.data.id ? event.data : u
      ));
      setSuccess('Un usuario fue actualizado');
      setTimeout(() => setSuccess(''), 3000);
    } else if (event.action === 'deleted') {
      // Remover usuario de la lista
      setUsers(prev => prev.filter(u => u.id !== event.data.id));
      setSuccess('Un usuario fue eliminado');
      setTimeout(() => setSuccess(''), 3000);
    }
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const usersData = await userService.getUsers();
      const usersList = Array.isArray(usersData) ? usersData : [];
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.dni?.includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setFormData({
        name: user.name || '',
        dni: user.dni || '',
        email: user.email || '',
        password: '',
        role: user.role || 'intern',
        gender: user.gender || 'masculino',
        birth_date: user.birth_date || '',
        phone: user.phone || '',
        emergency_contact: user.emergency_contact || '',
        address: user.address || '',
        district: user.district || '',
        city: user.city || '',
        university: user.university || '',
        semester: user.semester || '',
        position: user.position || '',
        start_date: user.start_date || '',
        end_date: user.end_date || '',
        entry_time: user.entry_time || '08:00',
        exit_time: user.exit_time || '13:00',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dni: '',
      email: '',
      password: '',
      role: 'intern',
      gender: 'masculino',
      birth_date: '',
      phone: '',
      emergency_contact: '',
      address: '',
      district: '',
      city: '',
      university: '',
      semester: '',
      position: '',
      start_date: '',
      end_date: '',
      entry_time: '08:00',
      exit_time: '13:00',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        await userService.createUser(formData);
        setSuccess('Usuario creado exitosamente');
      } else {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userService.updateUser(selectedUser.id, updateData);
        setSuccess('Usuario actualizado exitosamente');
      }
      
      handleCloseModal();
      // No necesitamos recargar, el broadcasting lo hará
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser.id);
      setSuccess('Usuario desactivado exitosamente');
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      // No necesitamos recargar, el broadcasting lo hará
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleResetPassword = async (user) => {
    if (!confirm(`¿Estás seguro de restablecer la contraseña de ${user.name}? La nueva contraseña será su DNI (${user.dni}).`)) {
      return;
    }

    try {
      await userService.resetPassword(user.id);
      setSuccess(`Contraseña restablecida correctamente. La nueva contraseña es: ${user.dni}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.response?.data?.message || 'Error al restablecer contraseña');
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

  // Verificar si el usuario actual es administrador
  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-gray-600">
            Administra usuarios del sistema - {filteredUsers.length} usuario(s) encontrado(s)
            {users.length !== filteredUsers.length && ` de ${users.length} total`}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Usuario
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Buscar por nombre, DNI o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="staff">Personal</option>
            <option value="intern">Practicantes</option>
          </Select>
        </div>
      </Card>

      <Card>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron usuarios</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => handleOpenModal('create')}
            >
              Crear Primer Usuario
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const isOwnProfile = currentUser?.id === user.id;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email || 'Sin email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.dni}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge type="role" value={user.role}>
                          {roleBadge.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.phone || 'Sin teléfono'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge type="status" value={user.is_active ? 'success' : 'error'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProfile(user)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          
                          {(isAdmin || isOwnProfile) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal('edit', user)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {isAdmin && !isOwnProfile && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResetPassword(user)}
                              >
                                <KeyIcon className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteConfirm(true);
                                }}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </>
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="DNI"
              name="dni"
              value={formData.dni}
              onChange={handleInputChange}
              maxLength={8}
              pattern="[0-9]{8}"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              label={modalMode === 'create' ? 'Contraseña' : 'Nueva Contraseña (opcional)'}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={modalMode === 'create'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Rol"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              disabled={!isAdmin}
            >
              <option value="admin">Administrador</option>
              <option value="staff">Personal</option>
              <option value="intern">Practicante</option>
            </Select>
            <Select
              label="Género"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </Select>
          </div>

          {/* Información de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <Input
              label="Contacto de Emergencia"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleInputChange}
            />
          </div>

          {/* Información adicional para practicantes */}
          {formData.role === 'intern' && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información de Prácticas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Universidad"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Semestre"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Fecha de Inicio"
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Fecha de Fin"
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Hora de Entrada"
                    type="time"
                    name="entry_time"
                    value={formData.entry_time}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Hora de Salida"
                    type="time"
                    name="exit_time"
                    value={formData.exit_time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedUser(null);
        }}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas desactivar al usuario <strong>{selectedUser?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Esta acción marcará al usuario como inactivo.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedUser(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Desactivar Usuario
            </Button>
          </div>
        </div>
      </Modal>

      {/* Profile Modal - Integrado directamente en este componente */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedUser(null);
        }}
        title="Perfil de Usuario"
        size="full"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h2>
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información Principal */}
              <div className="lg:col-span-1">
                <Card>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 mb-4">
                      <svg className="h-16 w-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-gray-600">{selectedUser.email || 'Sin email'}</p>
                    
                    <div className="mt-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                        selectedUser.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedUser.role === 'admin' ? 'Administrador' :
                         selectedUser.role === 'staff' ? 'Personal' : 'Practicante'}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">DNI:</span>
                      <span className="font-medium text-gray-900">{selectedUser.dni}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Género:</span>
                      <span className="font-medium text-gray-900">{selectedUser.gender === 'masculino' ? 'Masculino' : 'Femenino'}</span>
                    </div>
                    {selectedUser.birth_date && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Fecha de Nacimiento:</span>
                        <span className="font-medium text-gray-900">{new Date(selectedUser.birth_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedUser.age && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Edad:</span>
                        <span className="font-medium text-gray-900">{selectedUser.age} años</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones para administradores */}
                  {isAdmin && currentUser?.id !== selectedUser.id && (
                    <div className="mt-6 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedUser(prev => ({ ...prev, is_active: !prev.is_active }));
                          userService.updateUser(selectedUser.id, { is_active: !selectedUser.is_active });
                          setSuccess(`Usuario ${selectedUser.is_active ? 'desactivado' : 'activado'} correctamente`);
                          setTimeout(() => setSuccess(''), 3000);
                        }}
                      >
                        {selectedUser.is_active ? 'Desactivar Usuario' : 'Activar Usuario'}
                      </Button>
                      
                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={handleResetPassword}
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 012 8m-3-4a1 1 0 11-2 0 1 1 0 012 0zm-3-4h6" />
                        </svg>
                        Restablecer Contraseña
                      </Button>
                    </div>
                  )}
                </Card>
              </div>

              {/* Información Detallada */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="space-y-6">
                    {/* Información de Contacto */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{selectedUser.email || 'No registrado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 2.493a1 1 0 01-.684.949l.014.014a1 1 0 01.746.065l1.742 1.742a1 1 0 00.746.065l.014.014a1 1 0 01.684.949L19.972 22.316a1 1 0 01-.948.684H17a2 2 0 01-2-2V5z" />
                          </svg>
                          <div>
                            <p className="text-sm text-gray-600">Teléfono</p>
                            <p className="font-medium text-gray-900">{selectedUser.phone || 'No registrado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <p className="text-sm text-gray-600">Dirección</p>
                            <p className="font-medium text-gray-900">{selectedUser.address || 'No registrado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <p className="text-sm text-gray-600">Distrito</p>
                            <p className="font-medium text-gray-900">{selectedUser.district || 'No registrado'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información de Prácticas (solo para practicantes) */}
                    {selectedUser.role === 'intern' && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Prácticas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            </svg>
                            <div>
                              <p className="text-sm text-gray-600">Universidad</p>
                              <p className="font-medium text-gray-900">{selectedUser.university || 'No registrado'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            </svg>
                            <div>
                              <p className="text-sm text-gray-600">Semestre</p>
                              <p className="font-medium text-gray-900">{selectedUser.semester || 'No registrado'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-sm text-gray-600">Fecha de Inicio</p>
                              <p className="font-medium text-gray-900">
                                {selectedUser.start_date ? new Date(selectedUser.start_date).toLocaleDateString() : 'No registrado'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-sm text-gray-600">Fecha de Fin</p>
                              <p className="font-medium text-gray-900">
                                {selectedUser.end_date ? new Date(selectedUser.end_date).toLocaleDateString() : 'No registrado'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-sm text-gray-600">Horario</p>
                              <p className="font-medium text-gray-900">
                                {selectedUser.entry_time && selectedUser.exit_time 
                                  ? `${selectedUser.entry_time} - ${selectedUser.exit_time}`
                                  : 'No registrado'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Información de Cargo (solo para staff) */}
                    {selectedUser.role === 'staff' && selectedUser.position && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h4>
                        <div>
                          <p className="text-sm text-gray-600">Cargo</p>
                          <p className="font-medium text-gray-900">{selectedUser.position}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;