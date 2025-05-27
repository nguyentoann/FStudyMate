import React, { useState } from 'react';
import { format } from 'date-fns';
import { useChat } from '../context/ChatContext';
import ChatBox from './ChatBox';

const Chat = () => {
  const { 
    conversations, 
    unreadCount, 
    openConversation, 
    activeConversation
  } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conversation => 
    conversation.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full py-1.5 pl-8 pr-2 text-sm border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No conversations found
          </div>
        ) : (
          filteredConversations.map(conversation => (
            <div 
              key={conversation.userId}
              onClick={() => openConversation(conversation.userId)}
              className={`p-2 border-b cursor-pointer hover:bg-gray-50 ${
                activeConversation?.userId === conversation.userId ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img 
                    src={conversation.profileImageUrl || 'https://via.placeholder.com/40'} 
                    alt={conversation.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </div>
                <div className="ml-2 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{conversation.fullName}</p>
                      <p className="text-xs text-gray-500">@{conversation.username}</p>
                    </div>
                    {conversation.lastMessageTime && (
                      <span className="text-xs text-gray-500">
                        {format(new Date(conversation.lastMessageTime), 'MM/dd HH:mm')}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-600 truncate w-40">
                      {conversation.isLastMessageMine && <span className="text-xs text-gray-500 mr-1">You:</span>}
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-indigo-500 text-white text-xs rounded-full px-1.5 py-0.5 text-[10px]">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {activeConversation && <ChatBox />}
    </div>
  );
};

export default Chat; 