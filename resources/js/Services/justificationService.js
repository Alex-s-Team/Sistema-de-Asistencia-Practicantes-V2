import api from './api';

export const justificationService = {
  getJustifications: async (params = {}) => {
    const response = await api.get('/justifications', { params });
    return response.data;
  },

  createJustification: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

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

