import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useGroupChat } from '../context/GroupChatContext';
import { useAuth } from '../context/AuthContext';

const GroupChatBox = () => {
  const { activeGroup, localMessages, setLocalMessages, sendMessage, closeGroup } = useGroupChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Scroll to bottom when local messages change
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Create a temporary message for immediate display
    const tempMessage = {
      id: `temp-${Date.now()}`,
      groupId: activeGroup.id,
      senderId: user.id,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
      senderName: user.fullName,
      senderUsername: user.username,
      senderImage: user.profileImageUrl,
      senderRole: user.role,
      isTemp: true // Flag to identify temporary messages
    };
    
    // Optimistically add the message to the UI
    setLocalMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    // Actually send the message to the server
    const success = await sendMessage(activeGroup.id, tempMessage.message);
    
    if (!success) {
      // If sending failed, mark the message as failed
      setLocalMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, sendFailed: true } 
            : msg
        )
      );
    }
    
    setIsSubmitting(false);
  };
  
  if (!activeGroup) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col bg-white animate-chat-open">
      {/* Header */}
      <div className="p-2 border-b flex justify-between items-center bg-indigo-600 text-white">
        <div className="flex items-center">
          <div className="h-8 w-8 flex items-center justify-center bg-indigo-400 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="ml-2">
            <p className="font-medium text-sm">{activeGroup.name}</p>
            <p className="text-xs text-indigo-100">Class ID: {activeGroup.classId}</p>
          </div>
        </div>
        <button 
          onClick={closeGroup}
          className="text-white hover:text-gray-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-2 overflow-y-auto bg-gray-50">
        {localMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-4 text-sm">
            No messages yet. Start a conversation with your class group!
          </div>
        ) : (
          <div className="space-y-2">
            {localMessages.map((message) => {
              const isMyMessage = message.senderId === user.id;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex max-w-xs">
                    {!isMyMessage && (
                      <img 
                        src={message.senderImage || 'https://via.placeholder.com/32'} 
                        alt={message.senderName}
                        className="h-6 w-6 rounded-full object-cover mr-1 self-end"
                      />
                    )}
                    <div>
                      {!isMyMessage && (
                        <div className="text-xs text-gray-500 mb-1">
                          {message.senderName}
                          <span className="ml-1 px-1 py-0.5 text-[10px] rounded bg-gray-200">
                            {message.senderRole}
                          </span>
                        </div>
                      )}
                      <div 
                        className={`py-1.5 px-2 rounded-lg text-sm ${
                          isMyMessage 
                            ? `bg-indigo-600 text-white rounded-br-none ${message.isTemp ? 'opacity-70' : ''}`
                            : 'bg-white text-gray-800 border rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        {message.sendFailed && (
                          <p className="text-xs text-red-300">Failed to send. Try again.</p>
                        )}
                      </div>
                      <div className={`text-[10px] mt-0.5 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-gray-500">
                          {format(new Date(message.createdAt), 'HH:mm')}
                          {message.isTemp && ' (Sending...)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-2">
        <div className="flex">
          <input
            type="text"
            placeholder="Type a message to your class..."
            className="flex-1 py-1.5 px-2 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={!newMessage.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-4 w-4 m-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChatBox; 