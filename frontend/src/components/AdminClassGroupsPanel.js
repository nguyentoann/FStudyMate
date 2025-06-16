import React, { useState, useEffect } from 'react';
import { useGroupChat } from '../context/GroupChatContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/config';

const AdminClassGroupsPanel = () => {
  const { fetchAllClassGroups, openGroup } = useGroupChat();
  const { user } = useAuth();
  const [classGroups, setClassGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  // Fetch all class groups when component mounts
  useEffect(() => {
    const loadClassGroups = async () => {
      if (user && user.role === 'admin') {
        setLoading(true);
        try {
          const groups = await fetchAllClassGroups();
          setClassGroups(groups);
          setRetryCount(0); // Reset retry count on success
        } catch (err) {
          console.error(err);
          if (err.message?.includes('403') || err.status === 403) {
            setError('Access denied. Please refresh the page or login again.');
          } else {
            setError('Failed to load class groups');
          }
          // Increment retry count and avoid further retries if limit reached
          setRetryCount(prevCount => {
            const newCount = prevCount + 1;
            if (newCount >= MAX_RETRIES) {
              console.log(`Max retries (${MAX_RETRIES}) reached for loading class groups`);
            }
            return newCount;
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    // Only attempt to load if we haven't exceeded retry limit
    if (user && user.role === 'admin' && retryCount < MAX_RETRIES) {
      loadClassGroups();
    }
  }, [user, fetchAllClassGroups, retryCount]);
  
  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Handle clicking on a class group
  const handleGroupClick = (groupId) => {
    openGroup(groupId);
  };
  
  if (!user || user.role !== 'admin') {
    return <div className="text-center p-4">Access denied. Admin privileges required.</div>;
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">All Class Groups</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : classGroups.length === 0 ? (
        <div className="text-center text-gray-500 p-4">
          No class groups found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                        {group.imagePath ? (
                          <img 
                            src={`${API_URL}/chat/groups/image/${group.id}`}
                            alt={group.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{group.classId || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{group.messageCount || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(group.lastActivity)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                    <button
                      onClick={() => handleGroupClick(group.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Open Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminClassGroupsPanel; 