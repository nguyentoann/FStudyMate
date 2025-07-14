import React, { useState } from 'react';
import { format } from 'date-fns';
import { useGroupChat } from '../context/GroupChatContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/config';
import GroupChatBox from './GroupChatBox';
import CreateChatGroup from './CreateChatGroup';
import GroupMembersPanel from './GroupMembersPanel';

const GroupChat = () => {
  const {
    groups,
    openGroup,
    activeGroup,
    groupMembers,
    classStudentCount
  } = useGroupChat();
  const { user } = useAuth();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  // Separate class groups and custom groups
  const classGroups = groups.filter(group => !group.isCustom);
  const customGroups = groups.filter(group => group.isCustom);

  // Determine appropriate messaging based on user role
  const getEmptyClassGroupMessage = () => {
    if (user?.role === 'student' || user?.role === 'outsrc_student') {
      return "You don't have any class group chats yet. Check with your institution about your class assignment.";
    } else if (user?.role === 'lecturer') {
      return "You don't have any class group chats yet. Classes you teach will appear here.";
    } else if (user?.role === 'admin') {
      return "No class group chats available. You can create or join class groups.";
    } else {
      return "No class group chats available. Join a class to see group chats.";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Group list section */}
      <div className="flex-1 overflow-y-auto">
        {/* Class Groups */}
        <div className="px-3 py-2 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Class Group Chats</h2>
          <p className="text-sm text-gray-500">
            {classGroups.length === 0
              ? "No class groups available"
              : `${classGroups.length} class group${classGroups.length !== 1 ? 's' : ''} available`
            }
          </p>
        </div>

        {classGroups.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <svg className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-2">{getEmptyClassGroupMessage()}</p>
          </div>
        ) : (
          <div className="divide-y">
            {classGroups.map(group => (
              <div
                key={group.id}
                onClick={() => openGroup(group.id)}
                className={`p-3 hover:bg-gray-50 cursor-pointer ${activeGroup && activeGroup.id === group.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 overflow-hidden">
                    {group.imagePath ? (
                      <img 
                        src={`${API_URL}/chat/groups/image/${group.id}`} 
                        alt={group.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                  </div>

                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-500">Class: {group.classId}</p>
                      </div>

                      {group.lastActivity && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(group.lastActivity), 'MM/dd HH:mm')}
                        </span>
                      )}
                    </div>

                    <div className="mt-1">
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                        {group.messageCount || 0} messages
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Groups */}
        <div className="px-3 py-2 border-b mt-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Custom Group Chats</h2>
            <p className="text-sm text-gray-500">
              {customGroups.length === 0
                ? "No custom groups yet"
                : `${customGroups.length} custom group${customGroups.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            Create Group
          </button>
        </div>

        {customGroups.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <svg className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="mt-2">You haven't created any custom groups yet.</p>
            <p className="text-sm mt-1">Click "Create Group" to start a new conversation.</p>
          </div>
        ) : (
          <div className="divide-y">
            {customGroups.map(group => (
              <div
                key={group.id}
                onClick={() => openGroup(group.id)}
                className={`p-3 hover:bg-gray-50 cursor-pointer ${activeGroup && activeGroup.id === group.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 overflow-hidden">
                    {group.imagePath ? (
                      <img 
                        src={`${API_URL}/chat/groups/image/${group.id}`} 
                        alt={group.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>

                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-500">
                          {group.memberCount || 0} members
                          {group.creatorId === user.id && <span className="ml-2 text-blue-600">(Creator)</span>}
                        </p>
                      </div>

                      {group.lastActivity && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(group.lastActivity), 'MM/dd HH:mm')}
                        </span>
                      )}
                    </div>

                    <div className="mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {group.messageCount || 0} messages
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active group chat */}
      {activeGroup && <GroupChatBox />}

      {/* Add member button as a floating button */}
      {activeGroup && (
        <button
          onClick={() => setShowMembers(true)}
          className="absolute right-12 top-3 z-10 flex items-center gap-1 px-2 py-1 bg-indigo-100 rounded-full hover:bg-indigo-200 text-indigo-700"
          title="View members"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-xs font-medium">
            {activeGroup.isCustom ? groupMembers.length : classStudentCount}
          </span>
        </button>
      )}

      {/* Member list modal */}
      {showMembers && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <GroupMembersPanel onClose={() => setShowMembers(false)} />
        </div>
      )}

      {/* Create group modal */}
      {showCreateGroup && (
        <CreateChatGroup onClose={() => setShowCreateGroup(false)} />
      )}
    </div>
  );
};

export default GroupChat; 