// resources/js/Services/taskService.js
import api from './api';

export const taskService = {
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    console.log('getTasks response:', response.data);
    return response.data; // Array directamente
  },

  getMyTasks: async () => {
    const response = await api.get('/tasks/my-tasks');
    console.log('getMyTasks response:', response.data);
    return response.data; // Array directamente
  },

  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};