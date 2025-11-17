// resources/js/Services/authService.js
import api from './api';

export const authService = {
  /**
   * Login
   */
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  },

  /**
   * Obtener usuario actual
   */
  me: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  /**
   * Obtener perfil completo
   */
  getProfile: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  /**
   * Actualizar perfil
   */
  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (data) => {
    const response = await api.post('/change-password', data);
    return response.data;
  },

  /**
   * Verificar si hay token
   */
  hasToken: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Obtener token
   */
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;