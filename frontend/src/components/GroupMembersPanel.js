import React, { useState, useEffect } from 'react';
import { useGroupChat } from '../context/GroupChatContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/config';
import { makeApiCall } from '../utils/ApiUtils';

const GroupMembersPanel = ({ onClose }) => {
  const { activeGroup, groupMembers, fetchGroupMembers, addGroupMember, removeGroupMember } = useGroupChat();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  // Check if the current user can manage members (creator or admin)
  const canManageMembers = activeGroup && (
    (activeGroup.isCustom && activeGroup.creatorId === user.id) || 
    user.role === 'admin'
  );

  // Function to search users
  const searchUsers = async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await makeApiCall(`/user/search?term=${encodeURIComponent(searchTerm)}`, 'GET');
      
      if (response.ok) {
        const data = await response.json();
        // Filter out users who are already members
        const filteredResults = data.filter(u => !groupMembers.some(m => m.userId === u.id));
        setSearchResults(filteredResults);
      } else {
        setError('Failed to search users');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const debounceTimer = setTimeout(searchUsers, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleAddMember = async (userId) => {
    setIsAdding(true);
    setError(null);
    
    try {
      const result = await addGroupMember(activeGroup.id, userId);
      
      if (result.success) {
        setSearchTerm('');
        setSearchResults([]);
      } else {
        setError('Failed to add member');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    // Don't allow removing yourself from the group
    if (userId === user.id) {
      if (!window.confirm('Are you sure you want to leave this group?')) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to remove this member?')) {
        return;
      }
    }
    
    try {
      await removeGroupMember(activeGroup.id, userId);
      // If you removed yourself, close the panel
      if (userId === user.id) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  if (!activeGroup) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{activeGroup.name} - Members</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {groupMembers.length} members
        </div>
      </div>

      {/* Search and add members section - only visible if user can manage members */}
      {canManageMembers && (
        <div className="p-4 border-b">
          <div className="mb-2 font-medium">Add Members</div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSearching || isAdding}
            />
            {isSearching && (
              <div className="absolute right-3 top-2">
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-2 text-red-500 text-sm">{error}</div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-3 max-h-40 overflow-y-auto border rounded">
              {searchResults.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-2 hover:bg-gray-50 border-b last:border-b-0">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                      {user.profileImageUrl ? (
                        <img 
                          src={`${user.profileImageUrl}`} 
                          alt={user.fullName} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    <div className="ml-2">
                      <div className="font-medium text-sm">{user.fullName}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user.id)}
                    className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={isAdding}
                  >
                    {isAdding ? 'Adding...' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members list */}
      <div className="p-4">
        <div className="mb-2 font-medium">Group Members</div>
        <div className="max-h-64 overflow-y-auto">
          {groupMembers.map((member) => {
            const isCreator = activeGroup.isCustom && activeGroup.creatorId === member.userId;
            const isSelf = member.userId === user.id;
            const canRemove = canManageMembers && (!isCreator || isSelf);
            
            return (
              <div key={member.userId} className="flex justify-between items-center p-2 hover:bg-gray-50 border-b last:border-b-0">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                    {member.profileImageUrl ? (
                      <img 
                        src={`${member.profileImageUrl}`} 
                        alt={member.fullName} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                        {member.fullName ? member.fullName.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="ml-2">
                    <div className="font-medium text-sm">
                      {member.fullName}
                      {isCreator && <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">Creator</span>}
                      {isSelf && <span className="ml-2 text-xs text-gray-500">(You)</span>}
                    </div>
                    <div className="text-xs text-gray-500">@{member.username}</div>
                  </div>
                </div>
                
                {canRemove && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="ml-2 p-1 text-gray-500 hover:text-red-500"
                    title={isSelf ? "Leave group" : "Remove member"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isSelf ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      )}
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GroupMembersPanel; 