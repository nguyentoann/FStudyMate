import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../services/config';
import { makeApiCall } from '../utils/ApiUtils';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [localMessages, setLocalMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pauseAutoRefresh, setPauseAutoRefresh] = useState(false);

  // Check if videos are playing
  const areVideosPlaying = () => {
    // Check for native video elements
    const videoElements = document.querySelectorAll('video');
    for (const video of videoElements) {
      if (video && !video.paused && video.currentTime > 0) {
        return true;
      }
    }
    
    // Check for YouTube/Vimeo iframes
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      // If the iframe src contains these domains, it's likely a video
      if (iframe && (
          iframe.src.includes('youtube.com') || 
          iframe.src.includes('youtu.be') || 
          iframe.src.includes('vimeo.com')
        )) {
        // We can't directly check if the video is playing in an iframe
        // but we'll assume an active iframe might be playing
        return true;
      }
    }
    
    return false;
  };

  // Fetch user's conversations
  const fetchConversations = async () => {
    if (!user || pauseAutoRefresh) return;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/conversations/${user.id}`, 'GET');

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data);
      
      // Calculate total unread messages
      const total = data.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(total);
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (otherUserId, limit = 20, offset = 0) => {
    if (!user || !otherUserId || pauseAutoRefresh) return;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/messages/${user.id}/${otherUserId}?limit=${limit}&offset=${offset}`, 'GET');

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
      setLocalMessages(data);
      
      // After successfully fetching messages, update unread count
      fetchConversations();
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (receiverId, message) => {
    if (!user || !receiverId || !message.trim()) return false;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/send`, 'POST', {
        senderId: user.id,
        receiverId,
        message,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // After sending a message, refresh the conversation
      await fetchMessages(receiverId);
      return true;
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a message
  const deleteMessage = async (messageId) => {
    if (!user || !messageId) return false;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/messages/${messageId}?userId=${user.id}`, 'DELETE');

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      // After deleting a message, refresh the current conversation
      if (activeConversation) {
        await fetchMessages(activeConversation.userId);
      }
      return true;
      
    } catch (error) {
      console.error('Error deleting message:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Set active conversation and load its messages
  const openConversation = async (userId) => {
    // Find conversation in the list if it exists
    const conversation = conversations.find(c => c.userId === userId);
    if (conversation) {
      setActiveConversation(conversation);
    } else {
      // Create a new conversation object if it doesn't exist
      setActiveConversation({
        userId,
        unreadCount: 0,
        lastMessage: '',
        lastMessageTime: null,
      });
    }
    
    // Load the messages for this conversation
    await fetchMessages(userId);
  };

  // Close the active conversation
  const closeConversation = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  // Initial fetch of conversations when user logs in
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Check for playing videos to control auto-refresh
  useEffect(() => {
    const checkVideosInterval = setInterval(() => {
      const videoPlaying = areVideosPlaying();
      setPauseAutoRefresh(videoPlaying);
      
      // Log only when state changes to help with debugging
      if (videoPlaying !== pauseAutoRefresh) {
        console.log(`[Chat] ${videoPlaying ? 'Pausing' : 'Resuming'} auto-refresh due to video playback`);
      }
    }, 1000); // Check every second
    
    return () => clearInterval(checkVideosInterval);
  }, [pauseAutoRefresh]);

  // Set up periodic refresh of conversations
  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      // Skip refresh if video is playing
      if (pauseAutoRefresh) {
        return;
      }
      
      fetchConversations();
      
      // If there's an active conversation, refresh its messages
      if (activeConversation) {
        fetchMessages(activeConversation.userId);
      }
    }, 3000); // Refresh every 3 seconds for more immediate updates
    
    return () => clearInterval(intervalId);
  }, [user, activeConversation, pauseAutoRefresh]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        localMessages,
        setLocalMessages,
        unreadCount,
        loading,
        error,
        fetchConversations,
        fetchMessages,
        sendMessage,
        deleteMessage,
        openConversation,
        closeConversation,
        pauseAutoRefresh,
        setPauseAutoRefresh,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}; 