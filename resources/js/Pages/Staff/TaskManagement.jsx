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
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

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
    assigned_users: [], // Array de IDs
  });

  // 1. estado
  const [priorities, setPriorities] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar tareas e internos en paralelo
      const [tasksData, internsData] = await Promise.all([
        taskService.getTasks(),
        userService.getInterns(),
      ]);

      console.log('Tasks:', tasksData);
      console.log('Interns:', internsData);

      // Procesar tareas
      let tasksList = [];
      if (Array.isArray(tasksData)) {
        tasksList = tasksData;
      } else if (tasksData && typeof tasksData === 'object') {
        // Si viene agrupado por estado
        tasksList = [
          ...(tasksData.pending || []),
          ...(tasksData.in_progress || []),
          ...(tasksData.completed || []),
        ];
      }
      setTasks(tasksList);

      // Procesar internos
      const internsList = Array.isArray(internsData) ? internsData : [];
      setInterns(internsList);

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

  const toggleInternSelection = (internId) => {
    setFormData(prev => {
      const isSelected = prev.assigned_users.includes(internId);
      return {
        ...prev,
        assigned_users: isSelected
          ? prev.assigned_users.filter(id => id !== internId)
          : [...prev.assigned_users, internId]
      };
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      start_date: '',
      due_date: '',
      assigned_users: [],
    });
    setEditingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.assigned_users.length === 0) {
      setMessage({ type: 'error', text: 'Debes asignar al menos un practicante' });
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        assigned_users: formData.assigned_users.map(id => parseInt(id))
      };

      console.log('Submitting task:', submitData);

      if (editingTask) {
        await taskService.updateTask(editingTask.id, submitData);
        setMessage({ type: 'success', text: 'Tarea actualizada correctamente' });
      } else {
        await taskService.createTask(submitData);
        setMessage({ type: 'success', text: 'Tarea creada correctamente' });
      }

      setShowModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving task:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al guardar tarea',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Función para formatear fecha para input type="date"
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      
      // Convertir a objeto Date y luego a formato YYYY-MM-DD
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Función para obtener los IDs de los usuarios asignados
  const getAssignedUserIds = (task) => {
    // Intentar diferentes propiedades donde podrían estar los usuarios asignados
    if (task.assigned_users && Array.isArray(task.assigned_users)) {
      return task.assigned_users.map(u => typeof u === 'object' ? u.id : u);
    }
    
    if (task.assignedUsers && Array.isArray(task.assignedUsers)) {
      return task.assignedUsers.map(u => typeof u === 'object' ? u.id : u);
    }
    
    if (task.assigned_to && Array.isArray(task.assigned_to)) {
      return task.assigned_to.map(u => typeof u === 'object' ? u.id : u);
    }
    
    return [];
  };

  // Función para obtener los nombres de los usuarios asignados
  const getAssignedUserNames = (task) => {
    // Intentar diferentes propiedades donde podrían estar los usuarios asignados
    if (task.assigned_users && Array.isArray(task.assigned_users)) {
      return task.assigned_users.map(u => typeof u === 'object' ? u.name : u).join(', ');
    }
    
    if (task.assignedUsers && Array.isArray(task.assignedUsers)) {
      return task.assignedUsers.map(u => typeof u === 'object' ? u.name : u).join(', ');
    }
    
    if (task.assigned_to && Array.isArray(task.assigned_to)) {
      return task.assigned_to.map(u => typeof u === 'object' ? u.name : u).join(', ');
    }
    
    return 'Sin asignar';
  };

  const handleEdit = (task) => {
    console.log('Editing task:', task); // Debug para ver la estructura de datos
    
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      start_date: formatDateForInput(task.start_date),
      due_date: formatDateForInput(task.due_date),
      assigned_users: getAssignedUserIds(task),
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

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

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
                        {new Date(task.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha límite</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Asignado a</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getAssignedUserNames(task)}
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

      <Modal
        isOpen={showModal}
        onClose={() => !submitting && setShowModal(false)}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Título de la Tarea"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ej: Realizar subida de datos a porta gob.pe"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asignar a Practicantes *
            </label>
            
            {interns.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No hay practicantes disponibles. Primero debes crear usuarios con rol de practicante.
                </p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {interns.map(intern => (
                  <label
                    key={intern.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assigned_users.includes(intern.id)}
                      onChange={() => toggleInternSelection(intern.id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {intern.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {intern.university || 'Sin universidad'} - {intern.semester || 'N/A'}
                      </p>
                    </div>
                    {formData.assigned_users.includes(intern.id) && (
                      <CheckIcon className="h-5 w-5 text-green-600" />
                    )}
                  </label>
                ))}
              </div>
            )}
            
            {formData.assigned_users.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                {formData.assigned_users.length} practicante(s) seleccionado(s)
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              disabled={submitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting || formData.assigned_users.length === 0}
              className="flex-1"
            >
              {editingTask ? 'Actualizar' : 'Crear'} Tarea
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskManagement;