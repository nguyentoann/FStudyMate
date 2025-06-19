import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserQuizHistory } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const QuizHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 100,
    completionRate: 0,
    statusDistribution: {
      completed: 0,
      failed: 0,
      abandoned: 0,
      in_progress: 0
    }
  });

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      console.log("No user found in AuthContext, redirecting to login");
      toast.error('Please log in to view your quiz history');
      navigate('/login');
    }
  }, [user, navigate]);

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS = {
    completed: '#4ade80',
    failed: '#f87171',
    abandoned: '#fb923c',
    in_progress: '#60a5fa'
  };
  
  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        setLoading(true);
        
        // Use the user ID from AuthContext if available
        if (user && user.id) {
          console.log("Using user ID from AuthContext:", user.id);
          const response = await getUserQuizHistory(user.id);
          console.log("API response:", response);
          
          if (response.success) {
            // Sort by start time (newest first)
            const sortedHistory = response.history.sort((a, b) => 
              new Date(b.startTime) - new Date(a.startTime)
            );
            
            setQuizHistory(sortedHistory);
            calculateSummaryStats(sortedHistory);
          } else {
            console.error("API returned success: false", response);
            setError('Failed to fetch quiz history: ' + (response.message || 'Unknown error'));
          }
          return;
        }
        
        // Try to find user ID from localStorage
        const localUserId = findUserIdFromLocalStorage();
        if (!localUserId) {
          setError('User authentication error. Please log in again.');
          setLoading(false);
          return;
        }
        
        console.log("Fetching quiz history for user ID:", localUserId);
        const response = await getUserQuizHistory(localUserId);
        console.log("API response:", response);
        
        if (response.success) {
          // Sort by start time (newest first)
          const sortedHistory = response.history.sort((a, b) => 
            new Date(b.startTime) - new Date(a.startTime)
          );
          
          setQuizHistory(sortedHistory);
          calculateSummaryStats(sortedHistory);
        } else {
          console.error("API returned success: false", response);
          setError('Failed to fetch quiz history: ' + (response.message || 'Unknown error'));
        }
      } catch (err) {
        console.error("Error fetching quiz history:", err);
        console.error("Error details:", err.response?.data);
        console.error("Error status:", err.response?.status);
        setError('Error fetching quiz history. Please try again.');
        toast.error('Failed to load quiz history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizHistory();
  }, [user]);
  
  // Calculate summary statistics from quiz history
  const calculateSummaryStats = (history) => {
    if (!history || history.length === 0) {
      return;
    }
    
    const completedQuizzes = history.filter(quiz => quiz.status === 'completed');
    const totalScores = completedQuizzes.reduce((sum, quiz) => sum + (quiz.percentage || 0), 0);
    const avgScore = completedQuizzes.length > 0 ? totalScores / completedQuizzes.length : 0;
    
    let highest = 0;
    let lowest = 100;
    
    completedQuizzes.forEach(quiz => {
      if (quiz.percentage > highest) highest = quiz.percentage;
      if (quiz.percentage < lowest) lowest = quiz.percentage;
    });

    // Status distribution
    const statusDist = {
      completed: 0,
      failed: 0,
      abandoned: 0,
      in_progress: 0
    };
    
    history.forEach(quiz => {
      statusDist[quiz.status] = (statusDist[quiz.status] || 0) + 1;
    });
    
    // Completion rate
    const completionRate = history.length > 0 
      ? (completedQuizzes.length / history.length) * 100 
      : 0;
    
    setSummaryStats({
      totalQuizzes: history.length,
      averageScore: avgScore,
      highestScore: highest,
      lowestScore: lowest === 100 && completedQuizzes.length === 0 ? 0 : lowest,
      completionRate,
      statusDistribution: statusDist
    });
  };
  
  // Prepare data for charts
  const prepareScoreChartData = () => {
    // Get only completed quizzes with scores
    return quizHistory
      .filter(quiz => quiz.status === 'completed')
      .slice(0, 10) // Take last 10 quizzes
      .map((quiz, index) => ({
        name: `Quiz ${index + 1}`,
        score: parseFloat(quiz.percentage) || 0,
        quizId: quiz.quizId,
        date: format(new Date(quiz.startTime), 'MMM dd')
      }))
      .reverse(); // Reverse so oldest is first
  };
  
  const prepareStatusChartData = () => {
    return [
      { name: 'Completed', value: summaryStats.statusDistribution.completed || 0 },
      { name: 'Failed', value: summaryStats.statusDistribution.failed || 0 },
      { name: 'Abandoned', value: summaryStats.statusDistribution.abandoned || 0 },
      { name: 'In Progress', value: summaryStats.statusDistribution.in_progress || 0 }
    ].filter(item => item.value > 0);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    // Handle status as string
    const statusStr = typeof status === 'string' ? status : String(status);
    
    switch (statusStr) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'abandoned':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format duration in minutes and seconds
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // View quiz details
  const viewQuizDetails = (quizTakenId) => {
    // Navigate to quiz details page
    navigate(`/quiz-details/${quizTakenId}`);
  };

  // Helper function to find user ID from various localStorage sources
  const findUserIdFromLocalStorage = () => {
    try {
      // Try direct user object
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.id) {
          console.log("Found user ID in localStorage.user:", user.id);
          return user.id;
        }
      }
      
      // Try currentUser object
      const currentUserData = localStorage.getItem('currentUser');
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        if (currentUser && currentUser.id) {
          console.log("Found user ID in localStorage.currentUser:", currentUser.id);
          return currentUser.id;
        }
      }
      
      // Try direct userId
      const userId = localStorage.getItem('userId');
      if (userId) {
        console.log("Found direct userId in localStorage:", userId);
        return parseInt(userId, 10);
      }
      
      // Try sessionId as last resort
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        console.log("Found sessionId in localStorage, but no user ID");
      }
      
      console.error("Could not find user ID in any localStorage location");
      return null;
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Quiz History</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Quizzes Taken</h3>
                <p className="text-3xl font-semibold">{summaryStats.totalQuizzes}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
                <p className="text-3xl font-semibold">
                  {summaryStats.averageScore.toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Highest Score</h3>
                <p className="text-3xl font-semibold">
                  {summaryStats.highestScore.toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                <p className="text-3xl font-semibold">
                  {summaryStats.completionRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Score Trend Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Score Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareScoreChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Quiz Status Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Quiz Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareStatusChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareStatusChartData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === 'Completed' ? STATUS_COLORS.completed :
                              entry.name === 'Failed' ? STATUS_COLORS.failed :
                              entry.name === 'Abandoned' ? STATUS_COLORS.abandoned :
                              STATUS_COLORS.in_progress
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quiz History Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium">Quiz History</h3>
              </div>
              
              {quizHistory.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <p className="mb-2">No quiz attempts found</p>
                  <p className="text-sm">Take a quiz to see your history here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quiz
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Taken
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quizHistory.map((quiz) => (
                        <tr key={quiz.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Quiz #{quiz.quizId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(quiz.startTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {quiz.status === 'completed' ? (
                              <span className="font-medium">{quiz.percentage}%</span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(quiz.status)}`}>
                              {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1).replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDuration(quiz.completionTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => viewQuizDetails(quiz.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizHistory; 