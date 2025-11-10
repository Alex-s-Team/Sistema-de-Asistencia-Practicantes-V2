import React, { useState, useEffect } from 'react';
import { taskService } from '../../Services/taskService';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Badge } from '../../Components/Common/Badge';
import { Alert } from '../../Components/Common/Alert';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Modal } from '../../Components/Common/Modal';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '../../Utils/helpers';

const MyTasks = () => {
  const [tasks, setTasks] = useState({
    pending: [],
    in_progress: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('active'); // active, completed

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getMyTasks();
      setTasks(response);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setMessage({ type: 'error', text: 'Error al cargar las tareas' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await taskService.updateTask(taskId, { status: newStatus });
      setMessage({ type: 'success', text: 'Estado actualizado correctamente' });
      setShowDetailModal(false);
      await loadMyTasks();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar estado',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const getTasksByTab = () => {
    if (activeTab === 'active') {
      return [...tasks.in_progress, ...tasks.pending];
    }
    return tasks.completed;
  };

  const activeTasks = [...tasks.pending, ...tasks.in_progress];
  const completedTasks = tasks.completed;

  if (loading) {
    return <LoadingSpinner message="Cargando tareas..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Tareas</h1>
        <p className="text-gray-600 mt-1">
          Gestiona y da seguimiento a tus tareas asignadas
        </p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.pending.length}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Progreso</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.in_progress.length}</p>
            </div>
            <PlayIcon className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completadas</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.completed.length}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tareas Activas ({activeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'completed'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completadas ({completedTasks.length})
          </button>
        </div>
      </Card>

      {/* Tasks List */}
      {getTasksByTab().length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay tareas {activeTab === 'active' ? 'activas' : 'completadas'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'active'
                ? 'No tienes tareas pendientes o en progreso en este momento'
                : 'Aún no has completado ninguna tarea'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {getTasksByTab().map((task) => (
            <Card
              key={task.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openTaskDetail(task)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Fecha de inicio</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(task.start_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha límite</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(task.due_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Días restantes</p>
                      <p className={`font-medium ${
                        new Date(task.due_date) < new Date()
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {Math.ceil(
                          (new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24)
                        )} días
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => !updatingStatus && setShowDetailModal(false)}
        title="Detalles de la Tarea"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-4">
            {/* Title and Status */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedTask.title}
              </h3>
              <div className="flex gap-2">
                <Badge type="priority" value={selectedTask.priority}>
                  Prioridad: {selectedTask.priority === 'high' ? 'Alta' : 
                   selectedTask.priority === 'medium' ? 'Media' : 'Baja'}
                </Badge>
                <Badge type="status" value={selectedTask.status}>
                  {selectedTask.status === 'pending' ? 'Pendiente' : 
                   selectedTask.status === 'in_progress' ? 'En Progreso' : 'Completada'}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
              <p className="text-gray-600">{selectedTask.description}</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Fecha de inicio</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedTask.start_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha límite</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedTask.due_date)}
                </p>
              </div>
            </div>

            {/* Status Update Actions */}
            {selectedTask.status !== 'completed' && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Actualizar Estado
                </h4>
                <div className="flex gap-3">
                  {selectedTask.status === 'pending' && (
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus(selectedTask.id, 'in_progress')}
                      loading={updatingStatus}
                      disabled={updatingStatus}
                      className="flex-1"
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Iniciar Tarea
                    </Button>
                  )}
                  {selectedTask.status === 'in_progress' && (
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus(selectedTask.id, 'completed')}
                      loading={updatingStatus}
                      disabled={updatingStatus}
                      className="flex-1"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Marcar como Completada
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
                disabled={updatingStatus}
                className="flex-1"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyTasks;