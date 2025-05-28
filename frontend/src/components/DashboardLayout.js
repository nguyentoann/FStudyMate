import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useGroupChat } from '../context/GroupChatContext';
import Chat from './Chat';
import AIChat from './AIChat';
import GroupChat from './GroupChat';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();
  const { groups } = useGroupChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isGroupChatOpen, setIsGroupChatOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get the dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user || !user.role) return '/dashboard';
    
    switch (user.role) {
      case 'student': return '/student/dashboard';
      case 'lecturer': return '/lecturer/dashboard';
      case 'admin': return '/admin/dashboard';
      case 'guest': return '/guest/dashboard';
      case 'outsrc_student': return '/outsource/dashboard';
      default: return '/dashboard';
    }
  };

  // Default profile image if none provided
  const profileImage = user?.profileImageUrl || 'https://via.placeholder.com/150';

  // Handle opening AI chat
  const handleOpenAIChat = () => {
    // Close other chats if open
    setIsChatOpen(false);
    setIsGroupChatOpen(false);
    setIsAIChatOpen(!isAIChatOpen);
  };

  // Handle opening regular chat
  const handleOpenChat = () => {
    // Close other chats if open
    setIsAIChatOpen(false);
    setIsGroupChatOpen(false);
    setIsChatOpen(!isChatOpen);
  };
  
  // Handle opening group chat
  const handleOpenGroupChat = () => {
    // Close other chats if open
    setIsAIChatOpen(false);
    setIsChatOpen(false);
    setIsGroupChatOpen(!isGroupChatOpen);
  };

  // Check if user role is student or admin (roles that can use group chat)
  const canUseGroupChat = user?.role === 'student' || user?.role === 'admin';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Navbar - visible on all screens */}
      <Navbar toggleSidebar={() => setIsMenuOpen(!isMenuOpen)} />
      
      {/* Sidebar - Always visible on desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0 pt-14">
        <div className="flex flex-col w-64 bg-white shadow-md">
          <div className="flex flex-col flex-1 h-0 overflow-y-auto">
            <div className="flex flex-col items-center p-4 border-b">
              <img
                className="h-20 w-20 rounded-full object-cover mb-2"
                src={profileImage}
                alt="Profile"
              />
              <h2 className="text-lg font-semibold">{user?.fullName}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize mt-1">Role: {user?.role}</p>
            </div>
            
            <nav className="flex-1 px-2 py-4 bg-white">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Menu
              </h3>
              <div className="mt-2 space-y-1">
                <Link
                  to={getDashboardUrl()}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Profile
                </Link>
                <Link
                  to="/change-password"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Change Password
                </Link>
                <Link
                  to={getDashboardUrl()}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Home
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/users"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Manage Users
                  </Link>
                )}
                {(user?.role === 'lecturer' || user?.role === 'admin') && (
                  <Link
                    to="/questions"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Manage Questions
                  </Link>
                )}
                {(user?.role === 'student' || user?.role === 'outsrc_student' || user?.role === 'guest') && (
                  <Link
                    to="/quiz"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Take Quiz
                  </Link>
                )}
              </div>
            </nav>
            
            <div className="p-3 border-t">
              <button
                onClick={handleLogout}
                className="block w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white mt-14 z-[101]">
            <div className="absolute top-0 right-0 -mr-12 pt-2 z-[102]">
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 h-0 overflow-y-auto">
              <div className="flex flex-col items-center p-4 border-b">
                <img
                  className="h-20 w-20 rounded-full object-cover mb-2"
                  src={profileImage}
                  alt="Profile"
                />
                <h2 className="text-lg font-semibold">{user?.fullName}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize mt-1">Role: {user?.role}</p>
              </div>
              
              <nav className="flex-1 px-2 py-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Menu
                </h3>
                <div className="mt-2 space-y-1">
                  <Link
                    to={getDashboardUrl()}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/change-password"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Change Password
                  </Link>
                  <Link
                    to={getDashboardUrl()}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Home
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/users"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Manage Users
                    </Link>
                  )}
                  {(user?.role === 'lecturer' || user?.role === 'admin') && (
                    <Link
                      to="/questions"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Manage Questions
                    </Link>
                  )}
                  {(user?.role === 'student' || user?.role === 'outsrc_student' || user?.role === 'guest') && (
                    <Link
                      to="/quiz"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Take Quiz
                    </Link>
                  )}
                </div>
              </nav>
              
              <div className="p-3 border-t">
                <button
                  onClick={handleLogout}
                  className="block w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-14">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Mobile header - only show if not in the dashboard page */}
        {!location.pathname.includes('dashboard') && (
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-md lg:hidden mt-14">
            <div className="flex-1 flex items-center justify-center px-4">
              <h1 className="text-lg font-medium text-gray-700">
                {user?.role === 'admin' ? 'Admin Dashboard' : 
                 user?.role === 'lecturer' ? 'Lecturer Dashboard' : 
                 user?.role === 'student' ? 'Student Dashboard' : 
                 user?.role === 'outsrc_student' ? 'Outsource Student Dashboard' : 
                 user?.role === 'guest' ? 'Guest Dashboard' : 'Dashboard'}
              </h1>
            </div>
          </div>
        )}
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 mt-4">
          {children}
        </main>
      </div>
      
      {/* Chat buttons */}
      <div className="fixed bottom-4 right-4 z-[90] flex flex-col space-y-3">
        {/* AI Chat Button */}
        <button
          onClick={handleOpenAIChat}
          className="bg-purple-600 text-white p-3 rounded-full shadow-xl hover:bg-purple-700 focus:outline-none relative"
          title="AI Chat Assistant"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.051l.884.442c.396.198.598.628.425 1.04l-.774 1.84m0-7.106a24.301 24.301 0 00-4.5 0m0 0l.774 1.84c.173.412-.029.842-.425 1.04l-.884.442a2.25 2.25 0 00-1.357 2.051v5.714m7.5 0a2.25 2.25 0 001.591-.659l5.091-5.092m-5.091 5.092a2.25 2.25 0 01-1.591.659H9.75m0-6.75v6.75m3-12h-6"
            />
          </svg>
        </button>
        
        {/* Group Chat Button - only for students and admins */}
        {canUseGroupChat && (
          <button
            onClick={handleOpenGroupChat}
            className="bg-green-600 text-white p-3 rounded-full shadow-xl hover:bg-green-700 focus:outline-none relative"
            title="Class Group Chat"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {groups.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {groups.length}
              </span>
            )}
          </button>
        )}
        
        {/* Regular Chat Button */}
        <button
          onClick={handleOpenChat}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-xl hover:bg-indigo-700 focus:outline-none relative"
          title="Private Chat"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat popup */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-4 z-[90] w-11/12 md:w-96 h-[500px] max-w-md mx-auto md:mx-0 left-0 right-0 md:left-auto md:right-4 bg-white rounded-lg shadow-2xl overflow-hidden animate-chat-open">
          <div className="flex justify-between items-center p-3 bg-indigo-600 text-white">
            <h3 className="font-medium">Chat Messages</h3>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-[calc(100%-48px)]">
            <Chat />
          </div>
        </div>
      )}
      
      {/* Group Chat popup */}
      {isGroupChatOpen && (
        <div className="fixed bottom-28 right-4 z-[90] w-11/12 md:w-96 h-[500px] max-w-md mx-auto md:mx-0 left-0 right-0 md:left-auto md:right-4 bg-white rounded-lg shadow-2xl overflow-hidden animate-chat-open">
          <div className="flex justify-between items-center p-3 bg-green-600 text-white">
            <h3 className="font-medium">Class Groups</h3>
            <button 
              onClick={() => setIsGroupChatOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-[calc(100%-48px)]">
            <GroupChat />
          </div>
        </div>
      )}
      
      {/* AI Chat popup */}
      {isAIChatOpen && (
        <div className="fixed bottom-28 right-4 z-[90] w-11/12 md:w-96 h-[500px] max-w-md mx-auto md:mx-0 left-0 right-0 md:left-auto md:right-4 bg-white rounded-lg shadow-2xl overflow-hidden animate-chat-open">
          <div className="h-[calc(100%)]">
            <AIChat onClose={() => setIsAIChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout; 