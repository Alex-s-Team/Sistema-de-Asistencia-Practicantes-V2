import api from './api';

export const chatService = {
  // Obtener todos los chats del usuario
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  // Obtener un chat específico
  getChat: async (id) => {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  },

  // Crear nuevo chat
  createChat: async (data) => {
    const response = await api.post('/chats', data);
    return response.data;
  },

  // Buscar usuarios para chat privado
  searchUsers: async (query) => {
    const response = await api.get('/chats/search-users', {
      params: { query }
    });
    return response.data;
  },

  // Obtener chats públicos disponibles
  getPublicChats: async () => {
    const response = await api.get('/chats/public');
    return response.data;
  },

  // Unirse a un chat público
  joinChat: async (chatId) => {
    const response = await api.post(`/chats/${chatId}/join`);
    return response.data;
  },

  // Salir de un chat
  leaveChat: async (chatId) => {
    const response = await api.post(`/chats/${chatId}/leave`);
    return response.data;
  },

  // Obtener mensajes de un chat
  getMessages: async (chatId, params = {}) => {
    const response = await api.get(`/chats/${chatId}/messages`, { params });
    return response.data;
  },

  // Enviar mensaje
  sendMessage: async (chatId, content, attachment = null) => {
    const formData = new FormData();
    
    if (content) {
      formData.append('content', content);
    }
    
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

  // Marcar chat como leído
  markAsRead: async (chatId) => {
    const response = await api.post(`/chats/${chatId}/mark-as-read`);
    return response.data;
  },

  // Enviar evento de "escribiendo..."
  typing: async (chatId) => {
    const response = await api.post(`/chats/${chatId}/typing`);
    return response.data;
  },
};