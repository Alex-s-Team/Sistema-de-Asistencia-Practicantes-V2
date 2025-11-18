import api from './api';

export const justificationService = {
  getJustifications: async (params = {}) => {
    const response = await api.get('/justifications', { params });
    return response.data;
  },

  createJustification: async (formData) => {
    // Si formData es un objeto normal, convertirlo a FormData
    if (!(formData instanceof FormData)) {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      formData = data;
    }

    const response = await api.post('/justifications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  reviewJustification: async (id, status, reviewNotes) => {
    const response = await api.post(`/justifications/${id}/review`, {
      status,
      review_notes: reviewNotes,
    });
    return response.data;
  },

  getPendingJustifications: async () => {
    const response = await api.get('/justifications/pending');
    return response.data;
  },
};