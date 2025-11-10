// resources/js/Services/attendanceService.js
import api from './api';

export const attendanceService = {
  getAttendances: async (params = {}) => {
    const response = await api.get('/attendances', { params });
    console.log('getAttendances response:', response.data);
    return response.data; // Array directamente
  },

  markAttendance: async (data) => {
    const response = await api.post('/attendances', data);
    return response.data;
  },

  validate: async (id, data) => {
    const response = await api.post(`/attendances/${id}/validate`, data);
    return response.data;
  },

  getPending: async () => {
    const response = await api.get('/attendances/pending');
    console.log('getPending response:', response.data);
    return response.data; // Array directamente
  },

  getStats: async (params = {}) => {
    const response = await api.get('/attendances/stats', { params });
    return response.data;
  },
};