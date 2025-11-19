import api from './api';

export const attendanceService = {
  // Obtener todas las asistencias
  getAttendances: async (params = {}) => {
    const response = await api.get('/attendances', { params });
    
    // ✅ MANEJO CORRECTO: Devuelve directamente response.data
    return response.data;
  },

  // Obtener asistencia de hoy
  getTodayAttendance: async () => {
    const response = await api.get('/attendances/today');
    return response.data;
  },

  // Marcar asistencia
  markAttendance: async (data) => {
    const response = await api.post('/attendances', data);
    return response.data;
  },

  // Obtener asistencias pendientes
  getPending: async () => {
    const response = await api.get('/attendances/pending');
    return response.data;
  },

  // Validar asistencia
  validate: async (id, data) => {
    const response = await api.post(`/attendances/${id}/validate`, data);
    return response.data;
  },

  // Obtener estadísticas
  getStats: async (params = {}) => {
    const response = await api.get('/attendances/stats', { params });
    return response.data;
  },
};