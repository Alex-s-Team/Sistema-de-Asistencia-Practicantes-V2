import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatService } from '../Services/chatService';
import { useAuth } from '../Context/AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Cargar chats iniciales
  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  // Suscribirse a eventos de Echo cuando hay un chat activo
  useEffect(() => {
    if (!activeChat || !window.Echo) return;

    const channel = window.Echo.join(`chat.${activeChat.id}`)
      .here((users) => {
        console.log('Usuarios presentes:', users);
        setOnlineUsers(users);
      })
      .joining((user) => {
        console.log('Usuario se unió:', user);
        setOnlineUsers((prev) => [...prev, user]);
      })
      .leaving((user) => {
        console.log('Usuario salió:', user);
        setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
      })
      .listen('.message.sent', (data) => {
        console.log('Mensaje recibido:', data);
        setMessages((prev) => [...prev, data]);
        
        // Actualizar último mensaje en la lista de chats
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === data.chat_id
              ? { ...chat, messages: [data] }
              : chat
          )
        );
      })
      .listenForWhisper('typing', (data) => {
        console.log('Usuario escribiendo:', data);
        setTypingUsers((prev) => ({
          ...prev,
          [data.user.id]: data.user,
        }));

        // Limpiar después de 3 segundos
        setTimeout(() => {
          setTypingUsers((prev) => {
            const updated = { ...prev };
            delete updated[data.user.id];
            return updated;
          });
        }, 3000);
      });

    return () => {
      window.Echo.leave(`chat.${activeChat.id}`);
    };
  }, [activeChat]);

  // Cargar lista de chats
  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await chatService.getChats();
      setChats(data);
    } catch (error) {
      console.error('Error al cargar chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar un chat
  const selectChat = async (chat) => {
    try {
      setLoading(true);
      setActiveChat(chat);
      
      // Cargar mensajes del chat
      const messagesData = await chatService.getMessages(chat.id);
      setMessages(messagesData.data || messagesData);
      
      // Marcar como leído
      await chatService.markAsRead(chat.id);
      
      // Actualizar contador de no leídos
      setChats((prev) =>
        prev.map((c) =>
          c.id === chat.id ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (error) {
      console.error('Error al seleccionar chat:', error);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo chat
  const createChat = async (type, name, participants) => {
    try {
      const data = await chatService.createChat({
        type,
        name,
        participants,
      });
      
      setChats((prev) => [data.chat, ...prev]);
      setActiveChat(data.chat);
      
      return data.chat;
    } catch (error) {
      console.error('Error al crear chat:', error);
      throw error;
    }
  };

  // Enviar mensaje
  const sendMessage = async (content, attachment = null) => {
    if (!activeChat) return;

    try {
      const response = await chatService.sendMessage(
        activeChat.id,
        content,
        attachment
      );
      
      // El mensaje se agregará automáticamente vía WebSocket
      // pero lo agregamos localmente por si acaso
      const newMessage = response.data;
      setMessages((prev) => [...prev, newMessage]);
      
      return newMessage;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  };

  // Enviar evento de "escribiendo..."
  const sendTypingEvent = async () => {
    if (!activeChat) return;

    try {
      // Enviar al backend
      await chatService.typing(activeChat.id);
      
      // También enviar vía whisper para mayor inmediatez
      window.Echo.join(`chat.${activeChat.id}`).whisper('typing', {
        user: {
          id: user.id,
          name: user.name,
        },
      });
    } catch (error) {
      console.error('Error al enviar typing event:', error);
    }
  };

  // Unirse a chat público
  const joinPublicChat = async (chatId) => {
    try {
      const data = await chatService.joinChat(chatId);
      await loadChats();
      return data;
    } catch (error) {
      console.error('Error al unirse al chat:', error);
      throw error;
    }
  };

  // Salir de un chat
  const leaveChat = async (chatId) => {
    try {
      await chatService.leaveChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      
      if (activeChat?.id === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error al salir del chat:', error);
      throw error;
    }
  };

  const value = {
    chats,
    activeChat,
    messages,
    loading,
    typingUsers,
    onlineUsers,
    loadChats,
    selectChat,
    createChat,
    sendMessage,
    sendTypingEvent,
    joinPublicChat,
    leaveChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider');
  }
  return context;
};