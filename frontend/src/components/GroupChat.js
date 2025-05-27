import React from 'react';
import { format } from 'date-fns';
import { useGroupChat } from '../context/GroupChatContext';
import GroupChatBox from './GroupChatBox';

const GroupChat = () => {
  const { 
    groups, 
    openGroup, 
    activeGroup
  } = useGroupChat();

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b">
        <h2 className="text-lg font-semibold text-gray-700">Class Group Chats</h2>
        <p className="text-sm text-gray-500">
          {groups.length === 0 
            ? "No class groups available" 
            : `${groups.length} class group${groups.length !== 1 ? 's' : ''} available`
          }
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <svg className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-2">You don't have any class group chats yet.</p>
            <p className="text-sm mt-1">Check with your institution about your class assignment.</p>
          </div>
        ) : (
          <div className="divide-y">
            {groups.map(group => (
              <div 
                key={group.id} 
                onClick={() => openGroup(group.id)}
                className="p-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
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
      </div>
      
      {activeGroup && <GroupChatBox />}
    </div>
  );
};

export default GroupChat; 