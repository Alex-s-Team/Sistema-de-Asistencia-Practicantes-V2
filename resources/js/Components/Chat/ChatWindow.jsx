import React from 'react';
import { useChat } from '../../Context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = () => {
  const { activeChat, messages, typingUsers, onlineUsers, leaveChat } = useChat();

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Sistema de Chat
          </h2>
          <p className="text-gray-600">
            Selecciona una conversación o crea una nueva
          </p>
        </div>
      </div>
    );
  }

  // Obtener nombre del chat para mostrar
  const getChatDisplayName = () => {
    if (activeChat.type === 'public') {
      return activeChat.name || 'Chat Público';
    }
    return activeChat.other_user?.name || 'Chat Privado';
  };

  // Obtener subtítulo
  const getChatSubtitle = () => {
    if (activeChat.type === 'public') {
      const participantsCount = activeChat.users?.length || 0;
      const onlineCount = onlineUsers.length;
      return `${participantsCount} participantes • ${onlineCount} en línea`;
    }
    
    // Para chat privado, mostrar email del otro usuario
    return activeChat.other_user?.email || '';
  };

  // Manejar salir del chat
  const handleLeaveChat = async () => {
    const confirmLeave = window.confirm(
      '¿Estás seguro de que quieres salir de este chat?'
    );

    if (confirmLeave) {
      try {
        await leaveChat(activeChat.id);
      } catch (error) {
        alert('Error al salir del chat');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header del chat */}
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {activeChat.type === 'public' ? '🌐' : getChatDisplayName().charAt(0).toUpperCase()}
            </div>

            {/* Info del chat */}
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {getChatDisplayName()}
              </h2>
              <p className="text-sm text-gray-600">
                {getChatSubtitle()}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Indicador de usuarios online (solo para chats públicos) */}
            {activeChat.type === 'public' && onlineUsers.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{onlineUsers.length} en línea</span>
              </div>
            )}

            {/* Botón para salir del chat */}
            <button
              onClick={handleLeaveChat}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Salir del chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de mensajes */}
      <MessageList messages={messages} typingUsers={typingUsers} />

      {/* Input de mensajes */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;