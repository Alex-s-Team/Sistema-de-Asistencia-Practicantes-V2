// resources/js/Services/userService.js
import api from './api';

export const userService = {
  /**
   * Obtener todos los usuarios
   */
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  /**
   * ✅ Obtener solo practicantes activos
   */
  getInterns: async () => {
    try {
      console.log('🔄 Solicitando practicantes...');
      const response = await api.get('/users/interns');
      console.log('✅ Respuesta de /users/interns:', response.data);
      
      // Retornar directamente response.data
      // El backend ya devuelve el array o {data: [...]}
      return response.data;
    } catch (error) {
      console.error('❌ Error getting interns:', error);
      console.error('Response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Obtener un usuario específico
   */
  getUser: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo usuario
   */
  createUser: async (data) => {
    try {
      const response = await api.post('/users', data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Actualizar usuario
   */
  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Desactivar usuario
   */
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Resetear contraseña de usuario
   */
  resetPassword: async (id, data) => {
    try {
      const response = await api.post(`/users/${id}/reset-password`, data);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },
};