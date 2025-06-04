import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../services/config';
import { makeApiCall } from '../utils/ApiUtils';

const GroupChatContext = createContext();

export const useGroupChat = () => useContext(GroupChatContext);

export const GroupChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [localMessages, setLocalMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's class groups
  const fetchGroups = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/groups/${user.id}?role=${user.role}`, 'GET');

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      setGroups(data);
      
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a group
  const fetchMessages = async (groupId, limit = 50, offset = 0) => {
    if (!user || !groupId) return;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/groups/messages/${groupId}?limit=${limit}&offset=${offset}`, 'GET');

      if (!response.ok) {
        throw new Error('Failed to fetch group messages');
      }

      const data = await response.json();
      
      // Fetch files for each message
      for (const message of data) {
        try {
          const filesResponse = await makeApiCall(`/chat/files/${message.id}?messageType=group`, 'GET');
          if (filesResponse.ok) {
            message.files = await filesResponse.json();
          }
        } catch (filesError) {
          console.error('Error fetching files for message:', filesError);
        }
      }
      
      setMessages(data);
      setLocalMessages(data);
      
    } catch (error) {
      console.error('Error fetching group messages:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Send a group message
  const sendMessage = async (groupId, message) => {
    if (!user || !groupId || !message.trim()) return false;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/groups/send`, 'POST', {
        senderId: user.id,
        groupId,
        message,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // After sending a message, refresh the group messages
      await fetchMessages(groupId);
      return {
        success: true,
        messageId: data.messageId
      };
      
    } catch (error) {
      console.error('Error sending group message:', error);
      setError(error.message);
      return { success: false };
    } finally {
      setLoading(false);
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
      formData.append('messageType', 'group');
      
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
  
  // Unsend a group message
  const unsendMessage = async (messageId) => {
    if (!user || !messageId) return false;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/groups/unsend/${messageId}?userId=${user.id}`, 'POST');

      if (!response.ok) {
        throw new Error('Failed to unsend message');
      }

      // After unsending a message, refresh the current group's messages
      if (activeGroup) {
        await fetchMessages(activeGroup.id);
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

  // Set active group and load its messages
  const openGroup = async (groupId) => {
    // Find group in the list if it exists
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setActiveGroup(group);
      
      // Load the messages for this group
      await fetchMessages(groupId);
    }
  };

  // Close the active group
  const closeGroup = () => {
    setActiveGroup(null);
    setMessages([]);
    setLocalMessages([]);
  };

  // Initial fetch of groups when user logs in
  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  // Set up periodic refresh of groups and messages
  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      fetchGroups();
      
      // If there's an active group, refresh its messages
      if (activeGroup) {
        fetchMessages(activeGroup.id);
      }
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [user, activeGroup]);

  return (
    <GroupChatContext.Provider
      value={{
        groups,
        activeGroup,
        messages,
        localMessages,
        setLocalMessages,
        loading,
        error,
        fetchGroups,
        fetchMessages,
        sendMessage,
        uploadFile,
        downloadFile,
        unsendMessage,
        openGroup,
        closeGroup,
      }}
    >
      {children}
    </GroupChatContext.Provider>
  );
}; 