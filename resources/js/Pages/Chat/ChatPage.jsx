import React from 'react';
import ChatList from '../../Components/Chat/ChatList';
import ChatWindow from '../../Components/Chat/ChatWindow';

const ChatPage = () => {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      {/* Lista de chats - Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ChatList />
      </div>

      {/* Ventana de chat principal */}
      <ChatWindow />
    </div>
  );
};

export default ChatPage;