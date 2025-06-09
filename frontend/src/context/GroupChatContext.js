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
  const [groupMembers, setGroupMembers] = useState([]);
  const [classStudentCount, setClassStudentCount] = useState(0);
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

  // Create a new custom chat group
  const createCustomGroup = async (groupName) => {
    if (!user || !groupName.trim()) return { success: false };
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/groups/create`, 'POST', {
        name: groupName,
        creatorId: user.id
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }

      const data = await response.json();
      
      // After creating a group, refresh the groups list
      await fetchGroups();
      
      return {
        success: true,
        groupId: data.groupId
      };
      
    } catch (error) {
      console.error('Error creating custom group:', error);
      setError(error.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Fetch members of a group
  const fetchGroupMembers = async (groupId) => {
    if (!user || !groupId) return;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/groups/${groupId}/members`, 'GET');

      if (!response.ok) {
        throw new Error('Failed to fetch group members');
      }

      const data = await response.json();
      setGroupMembers(data);
      
    } catch (error) {
      console.error('Error fetching group members:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student count for a class
  const fetchClassStudentCount = async (classId) => {
    if (!user || !classId) return;
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/class/${classId}/student-count`, 'GET');

      if (!response.ok) {
        throw new Error('Failed to fetch class student count');
      }

      const data = await response.json();
      setClassStudentCount(data.count || 0);
      
    } catch (error) {
      console.error('Error fetching class student count:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a member to a group
  const addGroupMember = async (groupId, userId) => {
    if (!user || !groupId || !userId) return { success: false };
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/groups/${groupId}/members/add`, 'POST', {
        userId: userId,
        addedById: user.id
      });

      if (!response.ok) {
        throw new Error('Failed to add member');
      }
      
      // After adding a member, refresh the member list
      await fetchGroupMembers(groupId);
      
      return { success: true };
      
    } catch (error) {
      console.error('Error adding group member:', error);
      setError(error.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Remove a member from a group
  const removeGroupMember = async (groupId, userId) => {
    if (!user || !groupId || !userId) return { success: false };
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/groups/${groupId}/members/${userId}?removedById=${user.id}`, 'DELETE');

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }
      
      // After removing a member, refresh the member list
      await fetchGroupMembers(groupId);
      
      return { success: true };
      
    } catch (error) {
      console.error('Error removing group member:', error);
      setError(error.message);
      return { success: false };
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
  
  // Upload or update a group image
  const uploadGroupImage = async (groupId, file) => {
    if (!user || !groupId || !file) return { success: false };
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', user.id);
      
      // Use fetch directly since we're sending FormData
      const response = await fetch(`${API_URL}/chat/groups/${groupId}/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload group image');
      }

      const data = await response.json();
      
      // After updating a group image, refresh the groups list and members
      await fetchGroups();
      if (activeGroup && activeGroup.id === groupId) {
        await fetchGroupMembers(groupId);
      }
      
      return {
        success: true,
        imagePath: data.imagePath
      };
      
    } catch (error) {
      console.error('Error uploading group image:', error);
      setError(error.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  // Remove a group image
  const removeGroupImage = async (groupId) => {
    if (!user || !groupId) return { success: false };
    
    setLoading(true);
    try {
      const response = await makeApiCall(`/chat/groups/${groupId}/image?userId=${user.id}`, 'DELETE');

      if (!response.ok) {
        throw new Error('Failed to remove group image');
      }
      
      // After removing a group image, refresh the groups list and members
      await fetchGroups();
      if (activeGroup && activeGroup.id === groupId) {
        await fetchGroupMembers(groupId);
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Error removing group image:', error);
      setError(error.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Set active group, load its messages and members
  const openGroup = async (groupId) => {
    // Find group in the list if it exists
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setActiveGroup(group);
      
      // Load the messages for this group
      await fetchMessages(groupId);
      
      // Always load group members
      await fetchGroupMembers(groupId);
      
      // For class groups, also fetch the student count
      if (!group.isCustom && group.classId) {
        await fetchClassStudentCount(group.classId);
      }
    }
  };

  // Close the active group
  const closeGroup = () => {
    setActiveGroup(null);
    setMessages([]);
    setLocalMessages([]);
    setGroupMembers([]);
    setClassStudentCount(0);
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
        groupMembers,
        classStudentCount,
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
        createCustomGroup,
        fetchGroupMembers,
        addGroupMember,
        removeGroupMember,
        fetchClassStudentCount,
        uploadGroupImage,
        removeGroupImage
      }}
    >
      {children}
    </GroupChatContext.Provider>
  );
}; 