import React, { useState, useEffect } from 'react';
import { userService } from '../../Services/userService';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Input } from '../../Components/Common/Input';
import { Select } from '../../Components/Common/Select';
import { Badge } from '../../Components/Common/Badge';
import { Alert } from '../../Components/Common/Alert';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Modal } from '../../Components/Common/Modal';
import { Table } from '../../Components/Common/Table';
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../Utils/helpers';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterRole, setFilterRole] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'intern',
    gender: '',
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
    entry_time: '',
    exit_time: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: 'Error al cargar usuarios' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'intern',
      gender: '',
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
      entry_time: '',
      exit_time: '',
    });
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        setMessage({ type: 'success', text: 'Usuario actualizado correctamente' });
      } else {
        await userService.createUser(formData);
        setMessage({ type: 'success', text: 'Usuario creado correctamente' });
      }

      setShowModal(false);
      resetForm();
      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al guardar usuario',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'intern',
      gender: user.gender || '',
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
      entry_time: user.entry_time || '',
      exit_time: user.exit_time || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await userService.deleteUser(userId);
      setMessage({ type: 'success', text: 'Usuario eliminado correctamente' });
      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al eliminar usuario',
      });
    }
  };

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(u => u.role === filterRole);

  const columns = [
    {
      header: 'Nombre',
      accessor: 'name',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-primary-600">
              {user.name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Rol',
      accessor: 'role',
      render: (user) => (
        <Badge type="role" value={user.role}>
          {user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Personal' : 'Practicante'}
        </Badge>
      ),
    },
    {
      header: 'Universidad / Cargo',
      accessor: 'university',
      render: (user) => (
        <span className="text-sm text-gray-600">
          {user.role === 'intern' ? user.university : user.position || '-'}
        </span>
      ),
    },
    {
      header: 'Periodo',
      accessor: 'start_date',
      render: (user) => (
        user.role === 'intern' && user.start_date ? (
          <div className="text-sm text-gray-600">
            <div>{formatDate(user.start_date)}</div>
            <div>{formatDate(user.end_date)}</div>
          </div>
        ) : '-'
      ),
    },
    {
      header: 'Estado',
      accessor: 'is_active',
      render: (user) => (
        <Badge type="status" value={user.is_active ? 'approved' : 'rejected'}>
          {user.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (user) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(user)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(user.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Messages */}
      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Filters */}
      <Card>
        <div className="flex gap-4">
          <Select
            label="Filtrar por rol"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los roles' },
              { value: 'admin', label: 'Administradores' },
              { value: 'staff', label: 'Personal' },
              { value: 'intern', label: 'Practicantes' },
            ]}
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredUsers}
          emptyMessage="No hay usuarios registrados"
        />
      </Card>

      {/* User Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !submitting && setShowModal(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {!editingUser && (
              <Input
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            )}
            <Select
              label="Rol"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              options={[
                { value: 'intern', label: 'Practicante' },
                { value: 'staff', label: 'Personal' },
                { value: 'admin', label: 'Administrador' },
              ]}
              required
            />
            <Select
              label="Género"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Seleccionar...' },
                { value: 'masculino', label: 'Masculino' },
                { value: 'femenino', label: 'Femenino' },
              ]}
            />
            <Input
              label="Fecha de Nacimiento"
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleInputChange}
            />
          </div>

          {/* Contact Info */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Información de Contacto</h3>
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
              <Input
                label="Dirección"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
              <Input
                label="Distrito"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
              />
              <Input
                label="Ciudad"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Intern Specific Fields */}
          {formData.role === 'intern' && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Información de Prácticas</h3>
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
                <Input
                  label="Fecha de Inicio"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
                <Input
                  label="Fecha de Fin"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
                <Input
                  label="Hora de Entrada"
                  name="entry_time"
                  type="time"
                  value={formData.entry_time}
                  onChange={handleInputChange}
                />
                <Input
                  label="Hora de Salida"
                  name="exit_time"
                  type="time"
                  value={formData.exit_time}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* Staff/Admin Specific Fields */}
          {(formData.role === 'staff' || formData.role === 'admin') && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Información Laboral</h3>
              <Input
                label="Cargo"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={submitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={submitting}
              className="flex-1"
            >
              {editingUser ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;