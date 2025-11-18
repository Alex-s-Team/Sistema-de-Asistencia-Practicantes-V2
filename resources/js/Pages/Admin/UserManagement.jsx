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
import UserProfile from './UserProfile';
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
  const [statusFilter, setStatusFilter] = useState('all'); // Nuevo filtro de estado
  
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
      setUsers(prev => [...prev, event.data]);
      setSuccess('Nuevo usuario agregado al sistema');
      setTimeout(() => setSuccess(''), 3000);
    } else if (event.action === 'updated') {
      setUsers(prev => prev.map(u => 
        u.id === event.data.id ? { ...u, ...event.data } : u
      ));
      setSuccess('Un usuario fue actualizado');
      setTimeout(() => setSuccess(''), 3000);
    } else if (event.action === 'deleted') {
      // Cuando se "elimina" (desactiva), actualizar el estado
      setUsers(prev => prev.map(u => 
        u.id === event.data.id ? { ...u, is_active: false } : u
      ));
      setSuccess('Un usuario fue desactivado');
      setTimeout(() => setSuccess(''), 3000);
    }
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const usersData = await userService.getUsers();
      const usersList = Array.isArray(usersData) ? usersData : [];
      setUsers(usersList);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.dni?.includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // ✅ Filtrar por estado (activo/inactivo)
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => user.is_active === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => user.is_active === false);
    }
    // 'all' muestra todos sin filtrar

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
      await loadUsers(); // Recargar para asegurar consistencia
      
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
      await loadUsers(); // Recargar lista
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Error al desactivar usuario');
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
        {isAdmin && (
          <Button
            variant="primary"
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="all">Todos</option>
          </Select>
        </div>
      </Card>

      <Card>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron usuarios</p>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => handleOpenModal('create')}
              >
                Crear Primer Usuario
              </Button>
            )}
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
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.is_active ? 'opacity-60' : ''}`}>
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
                            title="Ver perfil"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenModal('edit', user)}
                                title="Editar usuario"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              
                              {!isOwnProfile && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResetPassword(user)}
                                    title="Restablecer contraseña"
                                  >
                                    <KeyIcon className="h-4 w-4" />
                                  </Button>
                                  
                                  {user.is_active && (
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setShowDeleteConfirm(true);
                                      }}
                                      title="Desactivar usuario"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}
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
        title="Confirmar Desactivación"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas desactivar al usuario <strong>{selectedUser?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            El usuario no podrá acceder al sistema, pero sus datos se conservarán.
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

      {/* Profile Modal - Usando el componente UserProfile */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedUser(null);
        }}
        title=""
        size="full"
      >
        {selectedUser && (
          <UserProfile 
            userId={selectedUser.id}
            onClose={() => {
              setShowProfileModal(false);
              setSelectedUser(null);
            }}
            showResetPassword={isAdmin}
          />
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;