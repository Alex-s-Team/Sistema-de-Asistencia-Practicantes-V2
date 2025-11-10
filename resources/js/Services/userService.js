// resources/js/Services/userService.js
import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    // La respuesta ya ES el array directamente
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // 👇 IMPORTANTE: La respuesta ya es el array directamente
  getInterns: async () => {
    const response = await api.get('/users/interns');
    console.log('getInterns response:', response.data); // Debug
    return response.data; // Ya es un array directamente
  },
};