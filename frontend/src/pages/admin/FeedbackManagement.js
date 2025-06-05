import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../services/config';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { Link } from 'react-router-dom';

const FeedbackManagement = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [feedbackList, setFeedbackList] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  // Fetch all feedback data (including hidden) on component mount
  useEffect(() => {
    // Redirect if not admin
    if (user && !user.isAdmin) {
      window.location.href = '/dashboard';
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all feedback (admin endpoint)
        const response = await axios.get(`${API_URL}/feedback/admin`, {
          withCredentials: true
        });
        
        setFeedbackList(response.data || []);
        
        // Calculate average rating manually from visible feedback
        const visibleFeedback = response.data.filter(f => f.visible);
        if (visibleFeedback.length > 0) {
          const sum = visibleFeedback.reduce((acc, curr) => acc + curr.rating, 0);
          setAverageRating(sum / visibleFeedback.length);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feedback data:', error);
        setStatusMessage({
          type: 'error',
          message: 'Failed to load feedback data. Please try again.'
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Handle feedback visibility toggle
  const handleToggleVisibility = async (feedbackId, currentVisibility) => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_URL}/feedback/toggle-visibility`,
        {
          feedbackId,
          visible: !currentVisibility
        },
        {
          withCredentials: true
        }
      );
      
      if (response.data.status === 'success') {
        // Update feedback list with new visibility
        setFeedbackList(prevList => 
          prevList.map(feedback => 
            feedback.id === feedbackId 
              ? { ...feedback, visible: !feedback.visible } 
              : feedback
          )
        );
        
        // Recalculate average rating
        const updatedVisibleFeedback = feedbackList
          .map(f => f.id === feedbackId ? { ...f, visible: !f.visible } : f)
          .filter(f => f.visible);
          
        if (updatedVisibleFeedback.length > 0) {
          const sum = updatedVisibleFeedback.reduce((acc, curr) => acc + curr.rating, 0);
          setAverageRating(sum / updatedVisibleFeedback.length);
        } else {
          setAverageRating(0);
        }
        
        setStatusMessage({
          type: 'success',
          message: `Feedback ${!currentVisibility ? 'shown to' : 'hidden from'} public`
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: 'Failed to update feedback visibility'
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error toggling feedback visibility:', error);
      setStatusMessage({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update feedback visibility'
      });
      setLoading(false);
    }
  };

  // Handle feedback deletion
  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.delete(`${API_URL}/feedback/?id=${feedbackId}`, {
        withCredentials: true
      });
      
      if (response.data.status === 'success') {
        // Remove feedback from list
        setFeedbackList(prevList => prevList.filter(feedback => feedback.id !== feedbackId));
        
        // Recalculate average rating
        const updatedVisibleFeedback = feedbackList
          .filter(f => f.id !== feedbackId && f.visible);
          
        if (updatedVisibleFeedback.length > 0) {
          const sum = updatedVisibleFeedback.reduce((acc, curr) => acc + curr.rating, 0);
          setAverageRating(sum / updatedVisibleFeedback.length);
        } else {
          setAverageRating(0);
        }
        
        setStatusMessage({
          type: 'success',
          message: 'Feedback deleted successfully'
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: 'Failed to delete feedback'
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setStatusMessage({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete feedback'
      });
      setLoading(false);
    }
  };

  // StarRating component for display
  const StarRating = ({ rating }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Feedback Management
              </h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage user feedback and reviews
              </p>
            </div>
            <div>
              <Link
                to="/admin/dashboard"
                className={`px-4 py-2 rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } transition duration-200`}
              >
                Back to Admin Dashboard
              </Link>
            </div>
          </div>
          
          {/* Status messages */}
          {statusMessage.message && (
            <div className={`p-4 mb-6 rounded-md ${statusMessage.type === 'success' ? 
              (darkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800') : 
              (darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800')}`}>
              {statusMessage.message}
            </div>
          )}
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Reviews */}
            <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Total Reviews
              </h2>
              <div className="text-4xl font-bold">
                {feedbackList.length}
              </div>
            </div>
            
            {/* Average Rating */}
            <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Average Rating
              </h2>
              <div className="flex items-center">
                <div className="text-4xl font-bold mr-4">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(averageRating)} />
              </div>
            </div>
            
            {/* Visible/Hidden Count */}
            <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Visibility Status
              </h2>
              <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div>
                  <span className="text-lg font-medium">Visible:</span> 
                  <span className="ml-2 text-lg font-bold text-green-500">
                    {feedbackList.filter(f => f.visible).length}
                  </span>
                </div>
                <div>
                  <span className="text-lg font-medium">Hidden:</span> 
                  <span className="ml-2 text-lg font-bold text-red-500">
                    {feedbackList.filter(f => !f.visible).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feedback Table */}
          <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className={`animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 ${darkMode ? 'border-white' : 'border-gray-900'}`}></div>
                        </div>
                      </td>
                    </tr>
                  ) : feedbackList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        No feedback found
                      </td>
                    </tr>
                  ) : (
                    feedbackList.map(feedback => (
                      <tr key={feedback.id} className={!feedback.visible && (darkMode ? 'bg-gray-900 bg-opacity-40' : 'bg-gray-100')}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">
                            {feedback.userName}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ID: {feedback.userId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StarRating rating={feedback.rating} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-sm line-clamp-2">
                            {feedback.comment}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(feedback.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            feedback.visible
                              ? (darkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800')
                              : (darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800')
                          }`}>
                            {feedback.visible ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleVisibility(feedback.id, feedback.visible)}
                              className={`px-3 py-1 rounded-md text-sm ${
                                feedback.visible
                                  ? (darkMode ? 'bg-red-800 hover:bg-red-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-800')
                                  : (darkMode ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800')
                              }`}
                            >
                              {feedback.visible ? 'Hide' : 'Show'}
                            </button>
                            <button
                              onClick={() => handleDeleteFeedback(feedback.id)}
                              className={`px-3 py-1 rounded-md text-sm ${
                                darkMode
                                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                              }`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FeedbackManagement; 