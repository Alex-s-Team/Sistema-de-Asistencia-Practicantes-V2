import api from './api';

export const chatService = {
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  getChat: async (id) => {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  },

  createChat: async (data) => {
    const response = await api.post('/chats', data);
    return response.data;
  },

  sendMessage: async (chatId, content, attachment = null) => {
    const formData = new FormData();
    formData.append('content', content);
    
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await api.post(`/chats/${chatId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMessages: async (chatId, params = {}) => {
    const response = await api.get(`/chats/${chatId}/messages`, { params });
    return response.data;
  },
};

