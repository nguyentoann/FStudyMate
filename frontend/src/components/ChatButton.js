import React from 'react';
import { useChat } from '../context/ChatContext';

const ChatButton = ({ userId, userName }) => {
  const { openConversation } = useChat();
  
  const handleStartChat = (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    openConversation(userId, { fullName: userName });
  };
  
  return (
    <button
      onClick={handleStartChat}
      className="text-indigo-600 hover:text-indigo-900 flex items-center"
      title={`Chat with ${userName}`}
    >
      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      Chat
    </button>
  );
};

export default ChatButton; 