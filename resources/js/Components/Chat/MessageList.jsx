import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../Context/AuthContext';

const MessageList = ({ messages, typingUsers }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Formatear hora del mensaje
  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear fecha completa
  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return messageDate.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  // Agrupar mensajes por fecha
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach((message) => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  // Renderizar tipo de archivo
  const renderAttachment = (message) => {
    if (!message.attachment_path) return null;

    const attachmentType = message.attachment_type;
    const attachmentUrl = message.attachment_url;

    switch (attachmentType) {
      case 'image':
        return (
          <div className="mt-2">
            <img
              src={attachmentUrl}
              alt="Imagen adjunta"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(attachmentUrl, '_blank')}
            />
          </div>
        );

      case 'pdf':
        return (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <span className="text-2xl">📄</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-900 truncate">Documento PDF</p>
              <p className="text-sm text-red-700">Click para abrir</p>
            </div>
          </a>
        );

      case 'word':
        return (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl">📘</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-blue-900 truncate">Documento Word</p>
              <p className="text-sm text-blue-700">Click para descargar</p>
            </div>
          </a>
        );

      case 'excel':
        return (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl">📊</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-green-900 truncate">Hoja de cálculo</p>
              <p className="text-sm text-green-700">Click para descargar</p>
            </div>
          </a>
        );

      default:
        return (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl">📎</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">Archivo adjunto</p>
              <p className="text-sm text-gray-700">Click para descargar</p>
            </div>
          </a>
        );
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p className="text-lg">No hay mensajes aún</p>
            <p className="text-sm mt-2">Sé el primero en enviar un mensaje</p>
          </div>
        </div>
      ) : (
        <>
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Separador de fecha */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-white px-4 py-1 rounded-full shadow-sm border text-sm text-gray-600">
                  {formatMessageDate(dateMessages[0].created_at)}
                </div>
              </div>

              {/* Mensajes de ese día */}
              {dateMessages.map((message, index) => {
                const isOwnMessage = message.user_id === user?.id;
                const showAvatar =
                  index === 0 ||
                  dateMessages[index - 1].user_id !== message.user_id;

                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${
                      isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                    } ${!showAvatar && !isOwnMessage ? 'ml-10' : ''}`}
                  >
                    {/* Avatar */}
                    {showAvatar && !isOwnMessage && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {message.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Mensaje */}
                    <div
                      className={`max-w-[70%] ${
                        isOwnMessage ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* Nombre del usuario (solo si no es mensaje propio) */}
                      {showAvatar && !isOwnMessage && (
                        <p className="text-xs text-gray-600 mb-1 px-1">
                          {message.user?.name}
                        </p>
                      )}

                      {/* Burbuja del mensaje */}
                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 rounded-bl-none'
                        }`}
                      >
                        {message.content && (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}

                        {/* Archivo adjunto */}
                        {renderAttachment(message)}

                        {/* Hora */}
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Indicador de "escribiendo..." */}
          {Object.keys(typingUsers).length > 0 && (
            <div className="flex items-center gap-2 ml-10">
              <div className="bg-gray-200 rounded-full px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {Object.values(typingUsers)[0]?.name} está escribiendo...
              </p>
            </div>
          )}

          {/* Referencia para scroll automático */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;