import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import VideoCallButton from './VideoCallButton';

const ChatBox = () => {
  const { activeConversation, localMessages, setLocalMessages, sendMessage, deleteMessage, closeConversation } = useChat();
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
  
  // Get user info from conversation list or from messages
  const otherUser = activeConversation && localMessages.length > 0 
    ? {
      id: activeConversation.userId,
      name: localMessages[0].senderId === user.id ? localMessages[0].receiverName : localMessages[0].senderName,
      username: localMessages[0].senderId === user.id ? localMessages[0].receiverUsername : localMessages[0].senderUsername,
      profileImageUrl: localMessages[0].senderId === user.id ? localMessages[0].receiverImage : localMessages[0].senderImage,
    }
    : {
      id: activeConversation?.userId,
      name: activeConversation?.fullName || 'User',
      username: activeConversation?.username || '',
      profileImageUrl: activeConversation?.profileImageUrl || 'https://via.placeholder.com/40',
    };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Create a temporary message for immediate display
    const tempMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: otherUser.id,
      message: newMessage.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      senderName: user.fullName,
      senderUsername: user.username,
      senderImage: user.profileImageUrl,
      receiverName: otherUser.name,
      receiverUsername: otherUser.username,
      receiverImage: otherUser.profileImageUrl,
      isTemp: true // Flag to identify temporary messages
    };
    
    // Optimistically add the message to the UI
    setLocalMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    // Actually send the message to the server
    const success = await sendMessage(otherUser.id, tempMessage.message);
    
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
  
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Delete this message?')) {
      // Optimistically remove from UI
      setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Then delete from server
      await deleteMessage(messageId);
    }
  };
  
  if (!activeConversation) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col bg-white animate-chat-open">
      {/* Header */}
      <div className="p-2 border-b flex justify-between items-center bg-indigo-600 text-white">
        <div className="flex items-center">
          <button
            onClick={closeConversation}
            className="text-white mr-2 hover:bg-indigo-700 p-1 rounded"
            aria-label="Back to conversation list"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img 
            src={otherUser.profileImageUrl || 'https://via.placeholder.com/40'} 
            alt={otherUser.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="ml-2">
            <p className="font-medium text-sm">{otherUser.name}</p>
            {otherUser.username && <p className="text-xs text-indigo-100">@{otherUser.username}</p>}
          </div>
        </div>
        <div className="flex items-center">
          <VideoCallButton userId={otherUser.id} userName={otherUser.name} />
          <button 
            onClick={closeConversation}
            className="text-white hover:text-gray-200 ml-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-2 overflow-y-auto bg-gray-50">
        {localMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-4 text-sm">
            No messages yet. Start a conversation!
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
                      <div 
                        className={`py-1.5 px-2 rounded-lg text-sm ${
                          isMyMessage 
                            ? `bg-indigo-600 text-white rounded-br-none ${message.isTemp ? 'opacity-70' : ''}`
                            : 'bg-white text-gray-800 border rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        {message.sendFailed && (
                          <p className="text-xs text-red-300">Failed to send. Tap to retry.</p>
                        )}
                      </div>
                      <div className={`text-[10px] mt-0.5 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-gray-500">
                          {format(new Date(message.createdAt), 'HH:mm')}
                          {message.isTemp && ' (Sending...)'}
                        </span>
                        {isMyMessage && !message.isTemp && (
                          <button 
                            onClick={() => handleDeleteMessage(message.id)}
                            className="ml-1.5 text-red-400 hover:text-red-600"
                            aria-label="Delete message"
                          >
                            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
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
            placeholder="Type a message..."
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

export default ChatBox; 