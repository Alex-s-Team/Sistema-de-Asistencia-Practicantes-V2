import React, { useState } from 'react';
import { useChat } from '../../Context/ChatContext';
import { useAuth } from '../../Context/AuthContext';
import { Button } from '../Common/Button';
import { Input } from '../Common/Input';
import { Modal } from '../Common/Modal';
import { chatService } from '../../Services/chatService';

const ChatList = () => {
  const { chats, activeChat, selectChat, createChat, loading } = useChat();
  const { user } = useAuth();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showPublicChatsModal, setShowPublicChatsModal] = useState(false);
  const [chatType, setChatType] = useState('private');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [publicChats, setPublicChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatName, setChatName] = useState('');
  const [searching, setSearching] = useState(false);

  // Buscar usuarios para chat privado
  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await chatService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
    } finally {
      setSearching(false);
    }
  };

  // Cargar chats públicos
  const handleLoadPublicChats = async () => {
    try {
      const chats = await chatService.getPublicChats();
      setPublicChats(chats);
      setShowPublicChatsModal(true);
    } catch (error) {
      console.error('Error al cargar chats públicos:', error);
    }
  };

    // Crear nuevo chat
const handleCreateChat = async () => {
  try {
    if (chatType === 'private' && !selectedUser) {
      alert('Selecciona un usuario');
      return;
    }

    if (chatType === 'public' && !chatName.trim()) {
      alert('Ingresa un nombre para el chat');
      return;
    }

    // Asegurar que los datos cumplan la validación del backend
    const name = chatType === 'public' ? chatName.trim() : null;
    const participants =
      chatType === 'private' && selectedUser
        ? [selectedUser.id]
        : [];
        await createChat(chatType, chatName, participants);
      
      // Limpiar y cerrar modal
      setShowNewChatModal(false);
      setChatName('');
      setSelectedUser(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error al crear chat:', error);
      alert('Error al crear el chat');
    }
  };

  // Obtener nombre del chat para mostrar
  const getChatDisplayName = (chat) => {
    if (chat.type === 'public') {
      return chat.name || 'Chat Público';
    }
    
    // Para chats privados, mostrar el nombre del otro usuario
    return chat.other_user?.name || 'Chat Privado';
  };

  // Formatear última fecha
  const formatLastMessageTime = (date) => {
    if (!date) return '';
    
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return messageDate.toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800">Chats</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleLoadPublicChats}
              title="Ver chats públicos"
            >
              🌐
            </Button>
            <Button
              size="sm"
              onClick={() => setShowNewChatModal(true)}
            >
              + Nuevo
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de chats */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tienes conversaciones aún</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => setShowNewChatModal(true)}
            >
              Crear nuevo chat
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => {
              const lastMessage = chat.messages?.[0];
              const isActive = activeChat?.id === chat.id;
              
              return (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getChatDisplayName(chat)}
                        </h3>
                        {chat.type === 'public' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Público
                          </span>
                        )}
                      </div>
                      
                      {lastMessage && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {lastMessage.user?.name === user?.name ? 'Tú: ' : ''}
                          {lastMessage.content || '📎 Archivo adjunto'}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end ml-2">
                      {lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(lastMessage.created_at)}
                        </span>
                      )}
                      
                      {chat.unread_count > 0 && (
                        <span className="mt-1 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Nuevo Chat */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => {
          setShowNewChatModal(false);
          setChatType('private');
          setChatName('');
          setSelectedUser(null);
          setSearchQuery('');
          setSearchResults([]);
        }}
        title="Nuevo Chat"
      >
        <div className="space-y-4">
          {/* Tipo de chat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de chat
            </label>
            <div className="flex gap-2">
              <Button
                variant={chatType === 'private' ? 'primary' : 'outline'}
                onClick={() => setChatType('private')}
                className="flex-1"
              >
                Privado
              </Button>
              <Button
                variant={chatType === 'public' ? 'primary' : 'outline'}
                onClick={() => setChatType('public')}
                className="flex-1"
              >
                Público
              </Button>
            </div>
          </div>

          {/* Chat Privado: Buscar usuario */}
          {chatType === 'private' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar usuario
              </label>
              <Input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
              />
              
              {searching && (
                <p className="text-sm text-gray-500 mt-2">Buscando...</p>
              )}
              
              {searchResults.length > 0 && (
                <div className="mt-2 border rounded max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => {
                        setSelectedUser(result);
                        setSearchQuery(result.name);
                        setSearchResults([]);
                      }}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                        selectedUser?.id === result.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-gray-600">{result.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat Público: Nombre */}
          {chatType === 'public' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del chat
              </label>
              <Input
                type="text"
                placeholder="Ej: Chat General"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewChatModal(false);
                setChatType('private');
                setChatName('');
                setSelectedUser(null);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateChat}>
              Crear Chat
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Chats Públicos */}
      <Modal
        isOpen={showPublicChatsModal}
        onClose={() => setShowPublicChatsModal(false)}
        title="Chats Públicos Disponibles"
      >
        <div className="space-y-2">
          {publicChats.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No hay chats públicos disponibles
            </p>
          ) : (
            publicChats.map((chat) => (
              <div
                key={chat.id}
                className="p-3 border rounded hover:bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-medium">{chat.name}</h4>
                  <p className="text-sm text-gray-600">
                    {chat.users_count} participantes
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      await chatService.joinChat(chat.id);
                      setShowPublicChatsModal(false);
                      window.location.reload(); // Recargar para actualizar lista
                    } catch (error) {
                      console.error('Error al unirse:', error);
                    }
                  }}
                >
                  Unirse
                </Button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ChatList;