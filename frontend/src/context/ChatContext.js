import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../services/config';
import { makeApiCall } from '../utils/ApiUtils';
import { useStabilizedContext } from '../hooks/useStabilizedContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [localMessages, setLocalMessages] = useState({});
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

  // Directly fetch messages with improved error handling
  const directFetchMessages = async (otherUserId, ignoreCache = false) => {
    if (!user || !otherUserId) {
      console.error('[ChatContext] Cannot fetch messages - missing user ID or recipient ID');
      return null;
    }

    console.log(`[ChatContext] Direct fetch messages between ${user.id} and ${otherUserId} (ignoreCache: ${ignoreCache})`);
    try {
      // Add a cache-busting parameter if needed
      const cacheBuster = ignoreCache ? `&_cb=${Date.now()}` : '';
      
      // Make a direct fetch call bypassing the normal API wrapper
      const response = await fetch(`${API_URL}/chat/messages/${user.id}/${otherUserId}?limit=50${cacheBuster}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[ChatContext] Direct API call retrieved ${data.length} messages:`, data);
      
      // Important - if we got messages directly, update our state
      if (data && data.length > 0) {
        setMessages(data);
        setLocalMessages(data);
        return data;
      } else {
        console.warn('[ChatContext] Direct API call returned no messages');
        return null;
      }
    } catch (error) {
      console.error('[ChatContext] Error in direct fetch:', error);
      return null;
    }
  };

  // Utility functions for message caching
  const saveMessagesToCache = (userId, messages) => {
    if (!user || !userId || !messages || messages.length === 0) return;
    try {
      // Create a cache key specific to this conversation
      const cacheKey = `chat_messages_${user.id}_${userId}`;
      // Only cache the last 50 messages to avoid storage limits
      const messagesToCache = messages.slice(-50);
      // Add timestamp for cache freshness checking
      const cache = {
        timestamp: Date.now(),
        messages: messagesToCache
      };
      localStorage.setItem(cacheKey, JSON.stringify(cache));
      console.log(`[ChatContext] Cached ${messagesToCache.length} messages for conversation with ${userId}`);
    } catch (error) {
      console.error('[ChatContext] Error caching messages:', error);
    }
  };

  const getMessagesFromCache = (userId) => {
    if (!user || !userId) return null;
    try {
      // Create a cache key specific to this conversation
      const cacheKey = `chat_messages_${user.id}_${userId}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (!cachedData) return null;
      
      const cache = JSON.parse(cachedData);
      // Check if cache is fresh (less than 1 hour old)
      const isFresh = Date.now() - cache.timestamp < 60 * 60 * 1000;
      if (!isFresh) {
        console.log('[ChatContext] Cache expired, removing...');
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      console.log(`[ChatContext] Found ${cache.messages.length} cached messages for conversation with ${userId}`);
      return cache.messages;
    } catch (error) {
      console.error('[ChatContext] Error retrieving cached messages:', error);
      return null;
    }
  };

  // Fetch messages for a conversation with improved consistency checks
  const fetchMessages = async (otherUserId, limit = 50, offset = 0) => {
    if (!user || !otherUserId || pauseAutoRefresh) return;
    
    setLoading(true);
    try {
      // Log for debugging
      console.log(`[ChatContext] Fetching messages between ${user.id} and ${otherUserId}`);
      
      // Make the API call to get messages
      const response = await makeApiCall(`/chat/messages/${user.id}/${otherUserId}?limit=${limit}&offset=${offset}`, 'GET');

      if (!response.ok) {
        console.error(`[ChatContext] API error fetching messages: ${response.status} ${response.statusText}`);
        
        // If we have a problem but know there should be messages, try direct fetch
        const conversation = conversations.find(c => c.userId === otherUserId);
        if (conversation && conversation.lastMessage) {
          console.log('[ChatContext] Attempting direct fetch as fallback...');
          const directMessages = await directFetchMessages(otherUserId, true);
          if (directMessages && directMessages.length > 0) {
            // Save successful messages to cache
            saveMessagesToCache(otherUserId, directMessages);
            // We recovered the messages, so return early
            setLoading(false);
            return;
          }
        }
        
        // If we still have no messages, try to load from cache
        const cachedMessages = getMessagesFromCache(otherUserId);
        if (cachedMessages && cachedMessages.length > 0) {
          console.log('[ChatContext] Using cached messages as last resort');
          setMessages(cachedMessages);
          setLocalMessages(cachedMessages);
          setLoading(false);
          return;
        }
        
        throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[ChatContext] Retrieved ${data.length} messages:`, data);
      
      // Save successful messages to cache
      if (data && data.length > 0) {
        saveMessagesToCache(otherUserId, data);
      }
      
      // Consistency check - if we expect messages but got none, try direct fetch
      if (data.length === 0) {
        const conversation = conversations.find(c => c.userId === otherUserId);
        if (conversation && conversation.lastMessage) {
          console.warn(`[ChatContext] Received 0 messages for conversation with ${otherUserId}, but lastMessage exists in conversation list. Trying direct fetch...`);
          const directMessages = await directFetchMessages(otherUserId, true);
          if (directMessages && directMessages.length > 0) {
            // Save successful messages to cache
            saveMessagesToCache(otherUserId, directMessages);
            // We recovered the messages, so return early
            setLoading(false);
            return;
          }
          
          // If direct fetch fails, try cache
          const cachedMessages = getMessagesFromCache(otherUserId);
          if (cachedMessages && cachedMessages.length > 0) {
            console.log('[ChatContext] Using cached messages after direct fetch failed');
            setMessages(cachedMessages);
            setLocalMessages(cachedMessages);
            setLoading(false);
            return;
          }
        }
      }
      
      // Fetch files for each message
      for (const message of data) {
        try {
          const filesResponse = await makeApiCall(`/chat/files/${message.id}?messageType=direct`, 'GET');
          if (filesResponse.ok) {
            message.files = await filesResponse.json();
          }
        } catch (filesError) {
          console.error('Error fetching files for message:', filesError);
        }
      }
      
      // Find any temp messages that should be preserved (not yet on server)
      const tempMessages = localMessages.filter(msg => 
        msg.isTemp && 
        !data.find(serverMsg => serverMsg.id === msg.id)
      );
      
      // Combine server messages with any temporary UI messages
      const combinedMessages = [...data, ...tempMessages];
      
      // For debugging if we have fewer messages than expected
      if (data.length > 0) {
        console.log(`[ChatContext] First message: ${data[0].message}, Last message: ${data[data.length-1].message}`);
      }
      
      // Update state with messages - use a callback to ensure we're getting the latest state
      setMessages(prev => {
        if (combinedMessages.length === 0 && prev.length > 0) {
          console.warn('[ChatContext] Would have set messages to empty array. Keeping previous messages:', prev);
          return prev;
        }
        return combinedMessages;
      });
      
      setLocalMessages(prev => {
        if (combinedMessages.length === 0 && prev.length > 0) {
          console.warn('[ChatContext] Would have set localMessages to empty array. Keeping previous messages:', prev);
          return prev;
        }
        return combinedMessages;
      });
      
      // After successfully fetching messages, update unread count
      fetchConversations();
      
    } catch (error) {
      console.error('[ChatContext] Error fetching messages:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update message send function to use our cache system
  const sendMessage = async (recipientId, content, files = []) => {
    if (!user || !recipientId || (!content && files.length === 0)) {
      console.error('Cannot send message: Missing required fields');
      return;
    }

    // Generate a temporary ID for the message
    const tempId = `temp-${Date.now()}`;

    // Create a temporary message to show immediately in UI
    const tempMessage = {
      id: tempId,
      senderId: user.id,
      senderName: user.fullName,
      recipientId,
      message: content || '',
      timestamp: new Date().toISOString(),
      isTemp: true,
      files: files.map(file => ({
        id: `temp-file-${Date.now()}-${file.name}`,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        isTemp: true
      }))
    };

    // Update state immediately for responsive UI
    setLocalMessages(prev => [...prev, tempMessage]);
    setMessages(prev => [...prev, tempMessage]);
    
    // Also update our cache immediately
    const allMessages = [...localMessages, tempMessage];
    saveMessagesToCache(recipientId, allMessages);

    try {
      // Send the message to the backend
      const response = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: recipientId,
          message: content || ""
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Get the real message back from the server
      const messageData = await response.json();
      const messageId = messageData.messageId || messageData.id;
      
      // Upload files if any
      let uploadedFiles = [];
      if (files && files.length > 0 && messageId) {
        for (const file of files) {
          const result = await uploadFile(file, messageId);
          if (result.success) {
            uploadedFiles.push(result.file);
          }
        }
      }
      
      // Add the uploaded files to the message data
      messageData.files = uploadedFiles;
      
      // Replace the temporary message with the real one
      setLocalMessages(prev => 
        prev.map(msg => msg.id === tempId ? { ...messageData, files: messageData.files || [] } : msg)
      );
      
      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? { ...messageData, files: messageData.files || [] } : msg)
      );
      
      // Also update the cache with the permanent message
      const updatedMessages = messages.map(msg => msg.id === tempId ? { ...messageData, files: messageData.files || [] } : msg);
      saveMessagesToCache(recipientId, updatedMessages);
      
      // Update conversations to show the new message
      await fetchConversations();

      return messageData;

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temp message if the send failed
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempId));
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError(error.message);
      return null;
    }
  };

  // Upload a file
  const uploadFile = async (file, messageId) => {
    if (!user || !messageId || !file) return { success: false };
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      formData.append('messageId', messageId);
      formData.append('messageType', 'direct');
      
      const response = await fetch(`${API_URL}/chat/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return {
        success: true,
        file: data.file
      };
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message);
      return { success: false };
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

  // Unsend a message (for everyone)
  const unsendMessage = async (messageId) => {
    if (!user || !messageId) return false;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/unsend/${messageId}?userId=${user.id}`, 'POST');

      if (!response.ok) {
        throw new Error('Failed to unsend message');
      }

      // After unsending a message, refresh the current conversation
      if (activeConversation) {
        await fetchMessages(activeConversation.userId);
      }
      return true;
      
    } catch (error) {
      console.error('Error unsending message:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Download a file
  const downloadFile = async (fileId) => {
    if (!user || !fileId) return { success: false };
    
    try {
      window.open(`${API_URL}/chat/files/download/${fileId}`, '_blank');
      return { success: true };
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(error.message);
      return { success: false };
    }
  };

  // Set active conversation and load its messages
  const openConversation = async (userId, userInfo = {}) => {
    console.log(`[ChatContext] Opening conversation with user ID: ${userId}`, userInfo);
    
    if (!userId) {
      console.error('[ChatContext] Cannot open conversation with null/undefined userId');
      return;
    }
    
    // Find conversation in the list if it exists
    const conversation = conversations.find(c => c.userId === userId);
    let hasKnownMessages = false;
    
    if (conversation) {
      console.log(`[ChatContext] Found existing conversation:`, conversation);
      setActiveConversation(conversation);
      
      // Check if conversation should have messages
      hasKnownMessages = conversation.lastMessage && conversation.lastMessage.trim() !== '';
      if (hasKnownMessages) {
        console.log(`[ChatContext] This conversation has a known lastMessage: "${conversation.lastMessage}"`);
      }
    } else {
      // Ensure we have minimum required userInfo
      const safeUserInfo = {
        fullName: userInfo.fullName || userInfo.name || 'User',
        username: userInfo.username || '',
        profileImageUrl: userInfo.profileImageUrl || 'https://via.placeholder.com/40',
        ...userInfo
      };
      
      console.log(`[ChatContext] Creating new conversation object for user ID: ${userId}`, safeUserInfo);
      setActiveConversation({
        userId,
        fullName: safeUserInfo.fullName,
        username: safeUserInfo.username,
        profileImageUrl: safeUserInfo.profileImageUrl,
        unreadCount: 0,
        lastMessage: '',
        lastMessageTime: null,
      });
    }
    
    // Clear any existing messages first to avoid showing old messages while loading
    setMessages([]);
    setLocalMessages([]);
    
    // First attempt to fetch via regular method
    fetchMessages(userId);
    
    // Set up a rescue strategy for conversations that should have messages
    if (hasKnownMessages) {
      setTimeout(() => {
        if (messages.length === 0) {
          console.log('[ChatContext] No messages loaded yet despite known conversation, trying direct fetch...');
          directFetchMessages(userId, true);
        }
      }, 1500);
      
      // One more last-ditch effort if needed
      setTimeout(() => {
        if (messages.length === 0) {
          console.log('[ChatContext] Still no messages, final attempt with cache busting...');
          directFetchMessages(userId, true);
        }
      }, 4000);
    }
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

  // Create the context value
  const contextValue = {
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
    uploadFile,
    downloadFile,
    deleteMessage,
    unsendMessage,
    openConversation,
    closeConversation,
    pauseAutoRefresh,
    setPauseAutoRefresh,
  };
  
  // Use stabilized context to prevent unnecessary re-renders
  const stabilizedContextValue = useStabilizedContext(
    contextValue, 
    ['conversations', 'messages', 'localMessages'], // Track localMessages changes too
    1000 // 1-second debounce
  );
  
  // Set up periodic refresh of conversations
  useEffect(() => {
    if (!user) return;
    
    // On initial mount, perform an immediate refresh of conversations
    console.log("[ChatContext] Performing initial conversation refresh");
    fetchConversations();
    
    // Set up a dedicated one-time retry for initial load
    const initialRetryTimeout = setTimeout(() => {
      if (conversations.length === 0) {
        console.log("[ChatContext] No conversations loaded initially, retrying...");
        fetchConversations();
      }
    }, 2000);
    
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
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(initialRetryTimeout);
    };
  }, [user, activeConversation, pauseAutoRefresh]);

  return (
    <ChatContext.Provider value={stabilizedContextValue}>
      {children}
    </ChatContext.Provider>
  );
}; 