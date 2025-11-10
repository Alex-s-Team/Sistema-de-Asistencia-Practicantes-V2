import api from './api';

export const attendanceService = {
  getAttendances: async (params = {}) => {
    const response = await api.get('/attendances', { params });
    return response.data;
  },

  markAttendance: async (data) => {
    const response = await api.post('/attendances', data);
    return response.data;
  },

  // CORREGIDO: cambié validateAttendance por validate
  validate: async (id, data) => {
    const response = await api.post(`/attendances/${id}/validate`, data);
    return response.data;
  },

  // AGREGADO: método getPending que faltaba
  getPending: async () => {
    const response = await api.get('/attendances/pending');
    return response.data;
  },

  getStats: async (params = {}) => {
    const response = await api.get('/attendances/stats', { params });
    return response.data;
  },
};