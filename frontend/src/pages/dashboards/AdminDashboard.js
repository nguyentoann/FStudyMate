import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  getUserStatistics, 
  getActiveUsers, 
  getLoginHistory, 
  getSambaStorageInfo, 
  getExpiredSessions, 
  getSessionsExpiringSoon, 
  forceLogoutSession,
  getSystemResources,
  performSpeedTest
} from '../../services/api';
import { API_URL } from '../../services/config';
import axios from 'axios';

// Default avatar path using the public folder (avoids CORS issues)
const DEFAULT_AVATAR = "/images/default-avatar.svg";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    newUsersToday: 0,
    averageSessionTime: 0,
    expiredSessions: 0
  });
  
  const [activeUsers, setActiveUsers] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [expiredSessions, setExpiredSessions] = useState([]);
  const [sessionsExpiringSoon, setSessionsExpiringSoon] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);
  const [isLoadingExpired, setIsLoadingExpired] = useState(true);
  const [isLoadingExpiringSoon, setIsLoadingExpiringSoon] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [refreshingData, setRefreshingData] = useState(false);
  
  // State for showing all sessions
  const [showAllExpired, setShowAllExpired] = useState(false);
  const [showAllExpiring, setShowAllExpiring] = useState(false);
  
  // Cache for user profile images
  const [userProfileCache, setUserProfileCache] = useState({});
  
  // State to track sessions being logged out
  const [loggingOutSessions, setLoggingOutSessions] = useState({});
  
  // System resources state
  const [systemResources, setSystemResources] = useState(null);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [speedTestResult, setSpeedTestResult] = useState(null);
  const [isRunningSpeedTest, setIsRunningSpeedTest] = useState(false);
  
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
        averageSessionTime: userStats.averageSessionTime,
        expiredSessions: userStats.expiredSessions || 0
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
      // Enhance active users with profile images
      const enhancedActiveUsers = await enhanceSessionsWithProfiles(activeUsersData);
      setActiveUsers(enhancedActiveUsers);
    } catch (error) {
      console.error("Error fetching active users:", error);
      setError(prev => prev || "Failed to load active users data.");
    } finally {
      setIsLoadingUsers(false);
    }
    
    // Fetch expired sessions
    try {
      setIsLoadingExpired(true);
      const expiredSessionsData = await getExpiredSessions();
      // Enhance expired sessions with profile images
      const enhancedExpiredSessions = await enhanceSessionsWithProfiles(expiredSessionsData);
      setExpiredSessions(enhancedExpiredSessions);
    } catch (error) {
      console.error("Error fetching expired sessions:", error);
      setError(prev => prev || "Failed to load expired sessions data.");
    } finally {
      setIsLoadingExpired(false);
    }
    
    // Fetch sessions expiring soon
    try {
      setIsLoadingExpiringSoon(true);
      const expiringSoonData = await getSessionsExpiringSoon(24); // Sessions expiring in next 24 hours
      // Enhance sessions expiring soon with profile images
      const enhancedExpiringSoonData = await enhanceSessionsWithProfiles(expiringSoonData);
      setSessionsExpiringSoon(enhancedExpiringSoonData);
    } catch (error) {
      console.error("Error fetching sessions expiring soon:", error);
      setError(prev => prev || "Failed to load sessions expiring soon data.");
    } finally {
      setIsLoadingExpiringSoon(false);
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
    
    // Fetch system resources
    try {
      setIsLoadingResources(true);
      const resourcesData = await getSystemResources();
      setSystemResources(resourcesData);
    } catch (error) {
      console.error("Error fetching system resources:", error);
      setError(prev => prev || "Failed to load system resources.");
    } finally {
      setIsLoadingResources(false);
    }
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    fetchDashboardData();
    
    // Also fetch system resources
    fetchSystemResources();
    
    // Set up polling interval
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);
  
  // Function to fetch system resources
  const fetchSystemResources = useCallback(async () => {
    try {
      setIsLoadingResources(true);
      const resources = await getSystemResources();
      setSystemResources(resources);
    } catch (error) {
      console.error("Error fetching system resources:", error);
    } finally {
      setIsLoadingResources(false);
    }
  }, []);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  // Function to handle force logout of a session
  const handleForceLogout = async (sessionId) => {
    try {
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to force logout this session?')) {
        return;
      }
      
      // Set loading state for this session
      setLoggingOutSessions(prev => ({
        ...prev,
        [sessionId]: true
      }));
      
      // Call the API to force logout the session
      await forceLogoutSession(sessionId);
      
      // Refresh the sessions data
      const expiringSoonData = await getSessionsExpiringSoon(24);
      const enhancedExpiringSoonData = await enhanceSessionsWithProfiles(expiringSoonData);
      setSessionsExpiringSoon(enhancedExpiringSoonData);
      
      // Update active users as well
      const activeUsersData = await getActiveUsers();
      const enhancedActiveUsersData = await enhanceSessionsWithProfiles(activeUsersData);
      setActiveUsers(enhancedActiveUsersData);
      
    } catch (error) {
      console.error("Error forcing logout:", error);
      alert("Failed to force logout the session. Please try again.");
    } finally {
      // Clear loading state for this session
      setLoggingOutSessions(prev => ({
        ...prev,
        [sessionId]: false
      }));
    }
  };
  
  // Function to handle running a speed test
  const handleRunSpeedTest = async (size) => {
    try {
      setIsRunningSpeedTest(true);
      setSpeedTestResult(null);
      
      const result = await performSpeedTest(size);
      setSpeedTestResult(result);
    } catch (error) {
      console.error("Error running speed test:", error);
      setSpeedTestResult({
        size: 0,
        time: 0,
        throughput: 0,
        unit: 'MB/s',
        error: error.message || 'Unknown error occurred'
      });
    } finally {
      setIsRunningSpeedTest(false);
    }
  };

  // Function to fetch user profile images
  const fetchUserProfileImage = useCallback(async (userId) => {
    // Check if we already have this user's profile in cache
    if (userProfileCache[userId]) {
      return userProfileCache[userId];
    }
    
    try {
      const response = await axios.get(`${API_URL}/admin/users/${userId}`);
      if (response.data && response.data.profileImageUrl) {
        // Update cache with the new profile image URL
        setUserProfileCache(prevCache => ({
          ...prevCache,
          [userId]: response.data.profileImageUrl
        }));
        return response.data.profileImageUrl;
      }
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      // Store null in cache to avoid repeated failed requests
      setUserProfileCache(prevCache => ({
        ...prevCache,
        [userId]: null
      }));
    }
    
    return null;
  }, [userProfileCache]);

  // Function to enhance sessions with profile images
  const enhanceSessionsWithProfiles = useCallback(async (sessions) => {
    if (!sessions || sessions.length === 0) return [];
    
    const enhancedSessions = [...sessions];
    const uniqueUserIds = [...new Set(sessions.map(session => session.userId).filter(id => id))];
    
    // Fetch profiles for all unique users
    for (const userId of uniqueUserIds) {
      const profileImageUrl = await fetchUserProfileImage(userId);
      // Update all sessions for this user with the profile image URL
      enhancedSessions.forEach(session => {
        if (session.userId === userId) {
          session.profileImageUrl = profileImageUrl;
        }
      });
    }
    
    return enhancedSessions;
  }, [fetchUserProfileImage]);

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
          {storageInfo && Object.keys(storageInfo).length > 0 ? (
            <div>
              {/* Storage usage summary */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Storage Usage ({storageInfo.usedSpace ? storageInfo.usedSpace.toFixed(1) : '0'} GB / {storageInfo.totalSpace ? storageInfo.totalSpace.toFixed(1) : '0'} GB)
                  </span>
                  <span className="text-sm font-medium text-indigo-600">
                    {storageInfo.usagePercentage ? storageInfo.usagePercentage.toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      storageInfo.usagePercentage > 85 ? 'bg-red-500' : 
                      storageInfo.usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(storageInfo.usagePercentage || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* File type distribution */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-blue-800 text-xs">Images</div>
                  <div className="font-semibold">{storageInfo.files?.images || 0}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-md">
                  <div className="text-purple-800 text-xs">Videos</div>
                  <div className="font-semibold">{storageInfo.files?.videos || 0}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-md">
                  <div className="text-amber-800 text-xs">Documents</div>
                  <div className="font-semibold">{storageInfo.files?.documents || 0}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-gray-800 text-xs">Other Files</div>
                  <div className="font-semibold">{storageInfo.files?.other || 0}</div>
                </div>
              </div>
              
              {/* Samba share information */}
              {storageInfo.shares && storageInfo.shares.length > 0 && (
                <>
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
                              {share.size ? share.size.toFixed(1) : '0'} GB
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-500">
                              {share.files}
                            </td>
                            <td className="px-3 py-2">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-indigo-500 h-1.5 rounded-full"
                                  style={{ width: `${storageInfo.totalSpace && storageInfo.totalSpace > 0 ? Math.min(((share.size || 0) / storageInfo.totalSpace * 100), 100).toFixed(1) : 0}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
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

  // Add this section for system resources
  const renderSystemResources = () => {
    return (
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">System Resources</h2>
          <div className="flex items-center">
            {isLoadingResources && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mr-2"></div>
            )}
            <button 
              onClick={() => {
                setIsLoadingResources(true);
                getSystemResources()
                  .then(data => setSystemResources(data))
                  .finally(() => setIsLoadingResources(false));
              }}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              disabled={isLoadingResources}
            >
              Refresh
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {systemResources ? (
            <div>
              {/* Server Information */}
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg mr-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {systemResources.server?.name || window.location.hostname}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {systemResources.server?.os} • Java {systemResources.server?.javaVersion} • 
                    Uptime: {formatUptime(systemResources.server?.uptime)}
                  </p>
                </div>
              </div>
              
              {/* Resource Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* CPU Usage */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                    <span className="text-sm font-medium text-blue-600">
                      {(systemResources.cpu?.load * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        systemResources.cpu?.load > 0.8 ? 'bg-red-500' : 
                        systemResources.cpu?.load > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((systemResources.cpu?.load || 0) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {systemResources.cpu?.cores} Cores • {systemResources.cpu?.model}
                  </div>
                </div>
                
                {/* Memory Usage */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                    <span className="text-sm font-medium text-blue-600">
                      {systemResources.memory?.usagePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        systemResources.memory?.usagePercentage > 80 ? 'bg-red-500' : 
                        systemResources.memory?.usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(systemResources.memory?.usagePercentage || 0, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {formatMemory(systemResources.memory?.used)} used of {formatMemory(systemResources.memory?.total)}
                  </div>
                </div>
                
                {/* Disk Usage */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                    <span className="text-sm font-medium text-blue-600">
                      {systemResources.disk?.usagePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        systemResources.disk?.usagePercentage > 80 ? 'bg-red-500' : 
                        systemResources.disk?.usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(systemResources.disk?.usagePercentage || 0, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {formatDiskSpace(systemResources.disk?.used)} used of {formatDiskSpace(systemResources.disk?.total)}
                  </div>
                </div>
                
                {/* Network Usage */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Network</span>
                    <span className="text-sm font-medium text-blue-600">
                      {systemResources.network?.ip}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      ↓ {systemResources.network?.receivedPerSec.toFixed(2)} MB/s
                    </span>
                    <span className="text-xs text-gray-500">
                      ↑ {systemResources.network?.sentPerSec.toFixed(2)} MB/s
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Speed Test Section */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-700">Speed Test</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleRunSpeedTest(1)}
                      disabled={isRunningSpeedTest}
                      className={`px-3 py-1 text-xs rounded-md ${
                        isRunningSpeedTest ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      1MB
                    </button>
                    <button 
                      onClick={() => handleRunSpeedTest(5)}
                      disabled={isRunningSpeedTest}
                      className={`px-3 py-1 text-xs rounded-md ${
                        isRunningSpeedTest ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      5MB
                    </button>
                    <button 
                      onClick={() => handleRunSpeedTest(10)}
                      disabled={isRunningSpeedTest}
                      className={`px-3 py-1 text-xs rounded-md ${
                        isRunningSpeedTest ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      10MB
                    </button>
                  </div>
                </div>
                
                {isRunningSpeedTest ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Running speed test...</span>
                  </div>
                ) : speedTestResult ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{speedTestResult.size.toFixed(2)} MB</div>
                        <div className="text-xs text-gray-500">Data Size</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{speedTestResult.time.toFixed(2)}s</div>
                        <div className="text-xs text-gray-500">Time</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{speedTestResult.throughput.toFixed(2)} MB/s</div>
                        <div className="text-xs text-gray-500">Throughput</div>
                      </div>
                    </div>
                    {speedTestResult.error && (
                      <div className="mt-2 text-xs text-red-500 text-center">
                        Error: {speedTestResult.error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Click a button above to run a speed test
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoadingResources ? 'Loading system resources...' : 'System resources information not available'}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Helper function to format memory size
  const formatMemory = (mb) => {
    if (mb === undefined) return "0 MB";
    if (mb < 1024) return `${mb.toFixed(0)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };
  
  // Helper function to format disk space
  const formatDiskSpace = (gb) => {
    if (gb === undefined) return "0 GB";
    if (gb < 1) return `${(gb * 1024).toFixed(0)} MB`;
    return `${gb.toFixed(1)} GB`;
  };
  
  // Helper function to format uptime
  const formatUptime = (minutes) => {
    if (!minutes) return "Unknown";
    
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) return `${hours}h ${remainingMinutes}m`;
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return `${days}d ${remainingHours}h`;
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
        
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  {successMessage}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button 
                    onClick={() => setSuccessMessage(null)}
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100"
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
                <p className="text-gray-500 text-sm">Expired Sessions</p>
                <p className="text-2xl font-bold">{stats.expiredSessions}</p>
                <p className="text-amber-600 text-xs mt-2">
                  Last 24 hours
                </p>
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
                  {activeUsers.map((activeUser, index) => (
                    <tr key={`active-${activeUser.id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img 
                              className="h-8 w-8 rounded-full object-cover border-2 border-indigo-300"
                              src={activeUser.profileImageUrl || DEFAULT_AVATAR} 
                              alt={activeUser.name.charAt(0)} 
                              onError={(e) => {e.target.src = DEFAULT_AVATAR}}
                            />
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
        
        {/* Session Expiration Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expired Sessions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Expired Sessions ({expiredSessions.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              {isLoadingExpired ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : expiredSessions.length > 0 ? (
                <div className={`overflow-y-auto ${showAllExpired ? 'max-h-96' : ''}`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expired</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expiredSessions.slice(0, showAllExpired ? expiredSessions.length : 5).map((session, index) => (
                        <tr key={`expired-${session.id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <img 
                                  className="h-8 w-8 rounded-full object-cover" 
                                  src={session.profileImageUrl || DEFAULT_AVATAR} 
                                  alt={session.name ? session.name.charAt(0) : 'U'} 
                                  onError={(e) => {e.target.src = DEFAULT_AVATAR}}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{session.name || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{session.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {session.expiredAgo ? `${Math.floor(session.expiredAgo / 60)}h ${session.expiredAgo % 60}m ago` : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.device || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No expired sessions found
                </div>
              )}
              
              {expiredSessions.length > 5 && (
                <div className="p-4 border-t text-center">
                  <button 
                    onClick={() => setShowAllExpired(!showAllExpired)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    {showAllExpired 
                      ? "Show Less" 
                      : `Show All ${expiredSessions.length} Expired Sessions`}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Sessions Expiring Soon */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Sessions Expiring Soon ({sessionsExpiringSoon.length})</h2>
              {isLoadingExpiringSoon && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              {isLoadingExpiringSoon ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                </div>
              ) : sessionsExpiringSoon.length > 0 ? (
                <div className={`overflow-y-auto ${showAllExpiring ? 'max-h-96' : ''}`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires In</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessionsExpiringSoon.slice(0, showAllExpiring ? sessionsExpiringSoon.length : 5).map((session, index) => {
                        // Calculate if session is expiring very soon (within 1 hour)
                        const expiresVerySoon = session.expiresIn && session.expiresIn < 60;
                        
                        return (
                          <tr key={`expiring-${session.id}-${index}`} className={expiresVerySoon ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <img 
                                    className={`h-8 w-8 rounded-full object-cover ${expiresVerySoon ? "border-2 border-red-500" : "border-2 border-amber-500"}`}
                                    src={session.profileImageUrl || DEFAULT_AVATAR} 
                                    alt={session.name ? session.name.charAt(0) : 'U'} 
                                    onError={(e) => {e.target.src = DEFAULT_AVATAR}}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{session.name || 'Unknown'}</div>
                                  <div className="text-xs text-gray-500">{session.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${expiresVerySoon ? "text-red-600" : "text-amber-600"}`}>
                                {session.expiresIn ? `${Math.floor(session.expiresIn / 60)}h ${session.expiresIn % 60}m` : 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatLastActivity(session.lastActivity)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {expiresVerySoon ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Expiring Soon
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button 
                                onClick={() => handleForceLogout(session.id)}
                                disabled={loggingOutSessions[session.id]}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                  loggingOutSessions[session.id]
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                {loggingOutSessions[session.id] ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                  </span>
                                ) : (
                                  'Force Logout'
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No sessions expiring soon
                </div>
              )}
              
              {sessionsExpiringSoon.length > 5 && (
                <div className="p-4 border-t text-center">
                  <button 
                    onClick={() => setShowAllExpiring(!showAllExpiring)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    {showAllExpiring 
                      ? "Show Less" 
                      : `Show All ${sessionsExpiringSoon.length} Sessions Expiring Soon`}
                  </button>
                </div>
              )}
            </div>
          </div>
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
        
        {/* System Resources */}
        {renderSystemResources()}
        
        
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
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="font-medium text-amber-800 mb-2">Class Management</h3>
              <p className="text-sm text-amber-600 mb-4">
                Create classes and assign students
              </p>
              <Link to="/admin/classes" className="px-4 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 inline-block">
                Manage Classes
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
              <div className="flex flex-col">
                <div className="text-sm mb-2">
                  <span className="font-medium">{stats.expiredSessions}</span> expired sessions
                </div>
                <Link to="/admin/sessions" className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 text-center">
                  View Sessions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard; 