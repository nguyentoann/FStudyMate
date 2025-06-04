import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getUserStatistics, getActiveUsers, getLoginHistory, getSambaStorageInfo } from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    newUsersToday: 0,
    averageSessionTime: 0
  });
  
  const [activeUsers, setActiveUsers] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);
  const [error, setError] = useState(null);
  const [refreshingData, setRefreshingData] = useState(false);
  
  const [recentUsers, setRecentUsers] = useState([
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'student', joinedDate: '2025-05-15' },
    { id: 2, name: 'Maria Johnson', email: 'maria@example.com', role: 'lecturer', joinedDate: '2025-05-14' },
    { id: 3, name: 'David Lee', email: 'david@example.com', role: 'student', joinedDate: '2025-05-12' },
    { id: 4, name: 'Sarah Brown', email: 'sarah@example.com', role: 'outsrc_student', joinedDate: '2025-05-10' }
  ]);
  
  const [systemAlerts, setSystemAlerts] = useState([
    { id: 1, type: 'warning', message: 'Database backup scheduled for tonight at 2:00 AM', date: '2025-05-19' },
    { id: 2, type: 'info', message: 'New system update available (v2.5.4)', date: '2025-05-18' },
    { id: 3, type: 'error', message: 'Failed login attempts detected from IP 192.168.1.45', date: '2025-05-17' }
  ]);

  // Fetch all data function
  const fetchDashboardData = useCallback(async () => {
    setError(null);
    
    // Fetch user statistics
    try {
      setIsLoadingStats(true);
      const userStats = await getUserStatistics();
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
        newUsersToday: userStats.newUsersToday,
        averageSessionTime: userStats.averageSessionTime
      }));
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      setError("Failed to load user statistics. Please try again.");
    } finally {
      setIsLoadingStats(false);
    }
    
    // Fetch active users
    try {
      setIsLoadingUsers(true);
      const activeUsersData = await getActiveUsers();
      setActiveUsers(activeUsersData);
    } catch (error) {
      console.error("Error fetching active users:", error);
      setError(prev => prev || "Failed to load active users data.");
    } finally {
      setIsLoadingUsers(false);
    }
    
    // Fetch login history
    try {
      setIsLoadingHistory(true);
      const loginData = await getLoginHistory();
      setLoginHistory(loginData);
    } catch (error) {
      console.error("Error fetching login history:", error);
      setError(prev => prev || "Failed to load login history.");
    } finally {
      setIsLoadingHistory(false);
    }
    
    // Fetch Samba storage information
    try {
      setIsLoadingStorage(true);
      const storageData = await getSambaStorageInfo();
      setStorageInfo(storageData);
    } catch (error) {
      console.error("Error fetching storage information:", error);
      setError(prev => prev || "Failed to load storage information.");
    } finally {
      setIsLoadingStorage(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
    
    // Refresh active users every 30 seconds
    const refreshInterval = setInterval(async () => {
      try {
        setRefreshingData(true);
        const activeUsersData = await getActiveUsers();
        setActiveUsers(activeUsersData);
        setRefreshingData(false);
      } catch (error) {
        console.error("Error refreshing active users:", error);
        setRefreshingData(false);
      }
    }, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchDashboardData]);

  // Function to format last activity time
  const formatLastActivity = (lastActivityTime) => {
    const lastActivity = new Date(lastActivityTime);
    const now = new Date();
    const diffSeconds = Math.floor((now - lastActivity) / 1000);
    
    if (diffSeconds < 5) {
      return 'Just now';
    } else if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffSeconds < 86400) { // Less than a day
      return lastActivity.toLocaleTimeString();
    } else {
      return lastActivity.toLocaleDateString() + ' ' + lastActivity.toLocaleTimeString();
    }
  };

  // Function to manually refresh data
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Add this section before the "Quick Actions" section
  const renderStorageSection = () => {
    return (
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Storage Information</h2>
          {isLoadingStorage && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
          )}
        </div>
        <div className="p-4">
          {storageInfo ? (
            <div>
              {/* Storage usage summary */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Storage Usage ({storageInfo.usedSpace.toFixed(1)} GB / {storageInfo.totalSpace} GB)
                  </span>
                  <span className="text-sm font-medium text-indigo-600">
                    {storageInfo.usagePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      storageInfo.usagePercentage > 85 ? 'bg-red-500' : 
                      storageInfo.usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${storageInfo.usagePercentage}%` }}
                  ></div>
                </div>
              </div>
              
              {/* File type distribution */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-blue-800 text-xs">Images</div>
                  <div className="font-semibold">{storageInfo.files.images}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-md">
                  <div className="text-purple-800 text-xs">Videos</div>
                  <div className="font-semibold">{storageInfo.files.videos}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-md">
                  <div className="text-amber-800 text-xs">Documents</div>
                  <div className="font-semibold">{storageInfo.files.documents}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-gray-800 text-xs">Other Files</div>
                  <div className="font-semibold">{storageInfo.files.other}</div>
                </div>
              </div>
              
              {/* Samba share information */}
              <h3 className="text-md font-medium text-gray-700 mb-3">Samba Shares</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {storageInfo.shares.map((share, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          {share.name}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {share.size} GB
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {share.files}
                        </td>
                        <td className="px-3 py-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-indigo-500 h-1.5 rounded-full"
                              style={{ width: `${(share.size / storageInfo.totalSpace * 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              {isLoadingStorage ? 'Loading storage information...' : 'No storage information available'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={handleRefresh} 
            disabled={isLoadingStats || isLoadingUsers || isLoadingHistory || isLoadingStorage}
            className={`px-4 py-2 rounded-lg text-white flex items-center ${
              isLoadingStats || isLoadingUsers || isLoadingHistory || isLoadingStorage ? 
              'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <svg 
              className={`w-4 h-4 mr-2 ${refreshingData ? 'animate-spin' : ''}`} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button 
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome back, {user?.fullName}!</h2>
          <p className="text-gray-600">
            Manage all aspects of the platform from this admin panel.
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoadingStats ? (
            Array(4).fill().map((_, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-green-600 text-xs mt-2">
                  +{stats.newUsersToday} today
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-500 text-sm">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-gray-500 text-xs mt-2">
                  {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total users
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-500 text-sm">Avg. Session Time</p>
                <p className="text-2xl font-bold">{stats.averageSessionTime} min</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-500 text-sm">Total Quizzes</p>
                <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
              </div>
            </>
          )}
        </div>
        
        {/* Active Users Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Online Users Now ({activeUsers.length})</h2>
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full ${refreshingData ? 'bg-yellow-500' : 'bg-green-500'} mr-2`}></span>
              <span className="text-sm text-gray-600">{refreshingData ? 'Updating...' : 'Live Data'}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {isLoadingUsers ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeUsers.map((activeUser) => (
                    <tr key={activeUser.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 font-semibold">
                            {activeUser.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{activeUser.name}</div>
                            <div className="text-xs text-gray-500">{activeUser.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {Math.floor(activeUser.activeTime / 60) > 0 ? 
                            `${Math.floor(activeUser.activeTime / 60)}h ${activeUser.activeTime % 60}m` : 
                            `${activeUser.activeTime}m`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatLastActivity(activeUser.lastActivity)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activeUser.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activeUser.device}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activeUser.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                        <button className="text-red-600 hover:text-red-900">Disconnect</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {activeUsers.length === 0 && !isLoadingUsers && (
            <div className="text-center py-8 text-gray-500">
              No active users at the moment
            </div>
          )}
        </div>
        
        {/* System Alerts */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">System Alerts</h2>
          </div>
          <div className="p-4">
            {systemAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`mb-4 p-4 rounded-md ${
                  alert.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                  alert.type === 'error' ? 'bg-red-50 border-l-4 border-red-400' :
                  'bg-blue-50 border-l-4 border-blue-400'
                }`}
              >
                <div className="flex">
                  <div className="flex-1">
                    <p className={`text-sm ${
                      alert.type === 'warning' ? 'text-yellow-700' :
                      alert.type === 'error' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {alert.message}
                    </p>
                    <p className={`text-xs ${
                      alert.type === 'warning' ? 'text-yellow-500' :
                      alert.type === 'error' ? 'text-red-500' :
                      'text-blue-500'
                    }`}>
                      {alert.date}
                    </p>
                  </div>
                  <div>
                    <button className="text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Login Activity Chart */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Login Activity (Last 7 Days)</h2>
          </div>
          <div className="p-4 h-64">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : loginHistory.length > 0 ? (
              <div className="h-full flex items-end">
                {loginHistory.map((day, index) => {
                  const maxCount = Math.max(...loginHistory.map(d => d.count));
                  const height = (day.count / maxCount) * 100;
                  const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                  
                  return (
                    <div key={index} className="flex flex-col items-center mx-2 flex-1">
                      <div 
                        className="bg-indigo-500 rounded-t w-full" 
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-gray-500">{dayName}</div>
                      <div className="text-xs font-medium">{day.count}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No login data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Storage Information */}
        {renderStorageSection()}
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Administrative Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="font-medium text-indigo-800 mb-2">User Management</h3>
              <p className="text-sm text-indigo-600 mb-4">
                Add, edit, or deactivate user accounts
              </p>
              <Link to="/admin/users" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 inline-block">
                Manage Users
              </Link>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-medium text-green-800 mb-2">System Settings</h3>
              <p className="text-sm text-green-600 mb-4">
                Configure application settings and preferences
              </p>
              <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Settings
              </button>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="font-medium text-purple-800 mb-2">Session Management</h3>
              <p className="text-sm text-purple-600 mb-4">
                Monitor and manage active user sessions
              </p>
              <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                View Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard; 