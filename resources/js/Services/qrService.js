import api from './api';

export const qrService = {
  getCurrentQR: async () => {
    const response = await api.get('/qr/current');
    return response.data;
  },

  validateQR: async (token) => {
    const response = await api.post('/qr/validate', { token });
    return response.data;
  },
};
