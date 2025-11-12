import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../Context/ChatContext';
import { Button } from '../Common/Button';

const MessageInput = () => {
  const { sendMessage, sendTypingEvent, activeChat } = useChat();
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Manejar cambio de texto y enviar evento de typing
  const handleMessageChange = (e) => {
    setMessage(e.target.value);

    // Enviar evento de "escribiendo..."
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendTypingEvent();

    typingTimeoutRef.current = setTimeout(() => {
      // El evento dejará de mostrarse después de 3 segundos
    }, 3000);
  };

  // Manejar selección de archivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 10MB.');
      return;
    }

    // Validar tipo
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido');
      return;
    }

    setAttachment(file);

    // Crear preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };

  // Remover archivo adjunto
  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() && !attachment) return;
    if (!activeChat) return;

    try {
      setSending(true);

      await sendMessage(message.trim(), attachment);

      // Limpiar campos
      setMessage('');
      setAttachment(null);
      setAttachmentPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Enfocar textarea
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  // Manejar Enter para enviar (Shift+Enter para nueva línea)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (file) => {
    if (!file) return '📎';
    
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('word')) return '📘';
    if (file.type.includes('sheet') || file.type.includes('excel')) return '📊';
    
    return '📎';
  };

  if (!activeChat) {
    return null;
  }

  return (
    <div className="border-t bg-white p-4">
      {/* Preview de archivo adjunto */}
      {attachment && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {attachmentPreview ? (
                <img
                  src={attachmentPreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-3xl">
                  {getFileIcon(attachment)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-gray-600">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="text-red-600 hover:text-red-700 p-2"
              title="Quitar archivo"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Formulario de entrada */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        {/* Botón de adjuntar archivo */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="Adjuntar archivo"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
        />

        {/* Textarea para el mensaje */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={1}
          />
          <p className="text-xs text-gray-500 mt-1">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </div>

        {/* Botón enviar */}
        <Button
          type="submit"
          disabled={(!message.trim() && !attachment) || sending}
          className="flex-shrink-0"
        >
          {sending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span>Enviar</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;