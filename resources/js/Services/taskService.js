import api from './api';

export const taskService = {
  // Obtener todas las tareas
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    
    // ✅ MANEJO CORRECTO: Devuelve directamente response.data
    return response.data;
  },

  // Crear nueva tarea
  createTask: async (data) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  // Obtener tareas del usuario actual
  getMyTasks: async () => {
    const response = await api.get('/tasks/my-tasks');
    
    // ✅ MANEJO CORRECTO: Devuelve directamente response.data
    return response.data;
  },

  // Obtener una tarea específica
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Actualizar tarea
  updateTask: async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  // Eliminar tarea
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};