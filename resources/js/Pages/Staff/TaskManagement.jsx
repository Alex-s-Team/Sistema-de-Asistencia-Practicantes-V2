import React, { useState, useEffect } from 'react';
import { taskService } from '../../Services/taskService';
import { userService } from '../../Services/userService';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Input } from '../../Components/Common/Input';
import { Select } from '../../Components/Common/Select';
import { Badge } from '../../Components/Common/Badge';
import { Alert } from '../../Components/Common/Alert';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Modal } from '../../Components/Common/Modal';
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../Utils/helpers';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    start_date: '',
    due_date: '',
    assigned_to: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, internsResponse] = await Promise.all([
        taskService.getTasks(),
        userService.getInterns(),
      ]);
      setTasks(tasksResponse.data || []);
      setInterns(internsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssignedToChange = (e) => {
    const options = e.target.selectedOptions;
    const values = Array.from(options).map(option => option.value);
    setFormData(prev => ({ ...prev, assigned_to: values }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      start_date: '',
      due_date: '',
      assigned_to: [],
    });
    setEditingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, formData);
        setMessage({ type: 'success', text: 'Tarea actualizada correctamente' });
      } else {
        await taskService.createTask(formData);
        setMessage({ type: 'success', text: 'Tarea creada correctamente' });
      }

      setShowModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al guardar tarea',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      start_date: task.start_date || '',
      due_date: task.due_date || '',
      assigned_to: task.assigned_to?.map(user => user.id.toString()) || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      await taskService.deleteTask(taskId);
      setMessage({ type: 'success', text: 'Tarea eliminada correctamente' });
      await loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al eliminar tarea',
      });
    }
  };

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);

  if (loading) {
    return <LoadingSpinner message="Cargando tareas..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tareas</h1>
          <p className="text-gray-600 mt-1">
            Crea y asigna tareas a los practicantes
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
          Nueva Tarea
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {tasks.filter(t => t.status === 'pending').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Pendientes</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {tasks.filter(t => t.status === 'in_progress').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">En Progreso</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">
            {tasks.filter(t => t.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Completadas</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <Select
          label="Filtrar por estado"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'Todas las tareas' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'in_progress', label: 'En Progreso' },
            { value: 'completed', label: 'Completadas' },
          ]}
        />
      </Card>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay tareas
            </h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'all' 
                ? 'Comienza creando tu primera tarea'
                : 'No hay tareas con este estado'}
            </p>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge type="priority" value={task.priority}>
                        {task.priority === 'high' ? 'Alta' : 
                         task.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                      <Badge type="status" value={task.status}>
                        {task.status === 'pending' ? 'Pendiente' : 
                         task.status === 'in_progress' ? 'En Progreso' : 'Completada'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Fecha de inicio</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(task.start_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha límite</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(task.due_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Asignado a</p>
                      <p className="text-sm font-medium text-gray-900">
                        {task.assigned_to?.map(u => u.name).join(', ') || 'Sin asignar'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(task)}
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !submitting && setShowModal(false)}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título de la Tarea"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ej: Realizar subida de datos a porta gob.pe"
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe la tarea en detalle..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Prioridad"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              options={[
                { value: 'low', label: 'Baja' },
                { value: 'medium', label: 'Media' },
                { value: 'high', label: 'Alta' },
              ]}
              required
            />

            <Select
              label="Estado"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: 'pending', label: 'Pendiente' },
                { value: 'in_progress', label: 'En Progreso' },
                { value: 'completed', label: 'Completada' },
              ]}
              required
            />

            <Input
              label="Fecha de Inicio"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Fecha Límite"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Asignar a Practicantes
            </label>
            <select
              multiple
              value={formData.assigned_to}
              onChange={handleAssignedToChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              size={5}
            >
              {interns.map(intern => (
                <option key={intern.id} value={intern.id}>
                  {intern.name} - {intern.university}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples practicantes
            </p>
          </div>

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
              {editingTask ? 'Actualizar' : 'Crear'} Tarea
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TaskManagement;