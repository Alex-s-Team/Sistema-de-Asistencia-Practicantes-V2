// ============================================================================
// resources/js/services/auth.js - SERVICIOS DE AUTENTICACIÓN
// ============================================================================
import api from './api';

export const authService = {
  async login(correo, contraseña) {
    try {
      const response = await api.post('/login', { correo, contraseña });
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  async getMe() {
    const response = await api.get('/me');
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};