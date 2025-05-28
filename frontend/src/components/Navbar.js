import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar = () => {} }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get the dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user || !user.role) return '/dashboard';
    
    switch (user.role.toLowerCase()) {
      case 'student': return '/student/dashboard';
      case 'lecturer': return '/lecturer/dashboard';
      case 'admin': return '/admin/dashboard';
      case 'guest': return '/guest/dashboard';
      case 'outsrc_student': return '/outsource/dashboard';
      default: return '/dashboard';
    }
  };
  
  return (
    <nav className="bg-indigo-600 text-white shadow-md py-2 px-4 fixed top-0 left-0 right-0 z-[95]">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left side - Logo, Brand, and Hamburger */}
        <div className="flex items-center">
          {/* Hamburger Menu Button - visible on all screens */}
          <button 
            onClick={toggleSidebar}
            className="mr-4 p-1 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo and Brand */}
          <Link to={user ? getDashboardUrl() : "/"} className="flex items-center space-x-2">
            <img 
              src="https://png.pngtree.com/png-vector/20220617/ourmid/pngtree-yellow-frog-with-happy-face-clipping-clipart-nature-vector-png-image_37070992.png" 
              alt="FStudyMate Logo" 
              className="h-10 w-10 object-contain bg-white rounded-full p-1"
            />
            <span className="text-xl font-bold text-white">FStudyMate</span>
          </Link>
        </div>
        
        {/* Center - Search Bar */}
        <div className="hidden md:flex md:flex-1 mx-4">
          <div className="relative w-full max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Right side - Menu and Notifications */}
        <div className="flex items-center space-x-4">
          {/* Search icon for mobile */}
          <button className="md:hidden text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
          </div>
          
          {/* User Profile */}
          {user && (
            <Link to="/profile" className="flex items-center space-x-2">
              <img 
                src={user.profileImageUrl || 'https://via.placeholder.com/40'} 
                alt={user.fullName} 
                className="h-8 w-8 rounded-full object-cover border-2 border-white"
              />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 