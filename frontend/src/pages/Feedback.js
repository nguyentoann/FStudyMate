import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/config';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { Link } from 'react-router-dom';

const Feedback = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [feedbackList, setFeedbackList] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userFeedback, setUserFeedback] = useState([]);
  const [formValues, setFormValues] = useState({ rating: 5, comment: '' });
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [editingFeedback, setEditingFeedback] = useState(null);

  // Fetch feedback data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all visible feedback
        const response = await axios.get(`${API_URL}/feedback/`, {
          withCredentials: true
        });
        
        setFeedbackList(response.data.feedback || []);
        setAverageRating(response.data.averageRating || 0);
        
        // Get user's feedback
        const userResponse = await axios.get(`${API_URL}/feedback/my`, {
          withCredentials: true
        });
        
        setUserFeedback(userResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    });
  };

  // Handle edit button click
  const handleEditClick = (feedback) => {
    setEditingFeedback(feedback);
    setFormValues({
      rating: feedback.rating,
      comment: feedback.comment
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingFeedback(null);
    setFormValues({ rating: 5, comment: '' });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formValues.comment.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a comment'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      let response;
      if (editingFeedback) {
        // Update existing feedback
        response = await axios.put(`${API_URL}/feedback/`, {
          feedbackId: editingFeedback.id,
          rating: formValues.rating,
          comment: formValues.comment
        }, {
          withCredentials: true
        });
      } else {
        // Submit new feedback
        response = await axios.post(`${API_URL}/feedback/`, formValues, {
          withCredentials: true
        });
      }
      
      if (response.data.status === 'success') {
        // Clear form and show success message
        setFormValues({ rating: 5, comment: '' });
        setEditingFeedback(null);
        setSubmitStatus({
          type: 'success',
          message: editingFeedback ? 'Feedback updated successfully!' : 'Your feedback has been submitted successfully!'
        });
        
        // Refresh feedback data
        const updatedResponse = await axios.get(`${API_URL}/feedback/`, {
          withCredentials: true
        });
        
        setFeedbackList(updatedResponse.data.feedback || []);
        setAverageRating(updatedResponse.data.averageRating || 0);
        
        const userResponse = await axios.get(`${API_URL}/feedback/my`, {
          withCredentials: true
        });
        
        setUserFeedback(userResponse.data || []);
      } else {
        setSubmitStatus({
          type: 'error',
          message: 'Failed to submit feedback. Please try again.'
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to submit feedback. Please try again.'
      });
      setLoading(false);
    }
  };

  // Handle feedback deletion
  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.delete(`${API_URL}/feedback/?id=${feedbackId}`, {
        withCredentials: true
      });
      
      if (response.data.status === 'success') {
        // Refresh feedback data
        const updatedResponse = await axios.get(`${API_URL}/feedback/`, {
          withCredentials: true
        });
        
        setFeedbackList(updatedResponse.data.feedback || []);
        setAverageRating(updatedResponse.data.averageRating || 0);
        
        const userResponse = await axios.get(`${API_URL}/feedback/my`, {
          withCredentials: true
        });
        
        setUserFeedback(userResponse.data || []);
        
        setSubmitStatus({
          type: 'success',
          message: 'Feedback deleted successfully'
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: 'Failed to delete feedback'
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete feedback'
      });
      setLoading(false);
    }
  };

  // Render star rating component
  const StarRating = ({ rating, onRatingChange }) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (onRatingChange) {
        // Interactive stars for form
        stars.push(
          <button
            key={i}
            type="button"
            className={`text-xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => onRatingChange({ target: { name: 'rating', value: i } })}
            title={`${i} star${i !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      } else {
        // Display-only stars
        stars.push(
          <span
            key={i}
            className={`text-xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        );
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              FStudyMate Feedback
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Share your experience and help us improve the platform.
            </p>
          </div>
          
          {/* Status messages */}
          {submitStatus.message && (
            <div className={`p-4 mb-6 rounded-md ${submitStatus.type === 'success' ? 
              (darkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800') : 
              (darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800')}`}>
              {submitStatus.message}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feedback Form */}
            <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingFeedback ? 'Edit Your Feedback' : 'Submit Your Feedback'}
              </h2>
              
              {userFeedback.length > 0 && !editingFeedback ? (
                <div>
                  <p className="mb-4">
                    You have already submitted feedback. You can edit or delete your existing feedback.
                  </p>
                  {userFeedback.map((feedback) => (
                    <div key={feedback.id} className={`p-4 rounded-md mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <StarRating rating={feedback.rating} />
                        <div className="space-x-2">
                          <button
                            onClick={() => handleEditClick(feedback)}
                            className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFeedback(feedback.id)}
                            className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{feedback.comment}</p>
                      <p className="text-xs text-gray-500">{formatDate(feedback.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Rating
                    </label>
                    <StarRating rating={formValues.rating} onRatingChange={handleInputChange} />
                  </div>
                  
                  <div className="mb-4">
                    <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Comment
                    </label>
                    <textarea
                      name="comment"
                      value={formValues.comment}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded-md ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border`}
                      rows="4"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : (editingFeedback ? 'Update Feedback' : 'Submit Feedback')}
                    </button>
                    {editingFeedback && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white`}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
            
            {/* Feedback Summary */}
            <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Overall Rating
              </h2>
              
              <div className="flex items-center mb-6">
                <span className="text-4xl font-bold mr-4">
                  {averageRating ? averageRating.toFixed(1) : '0.0'}
                </span>
                <StarRating rating={Math.round(averageRating)} />
              </div>
              
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Based on {feedbackList.length} {feedbackList.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            
            {/* User Reviews */}
            <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                About FStudyMate
              </h2>
              
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                FStudyMate is an educational platform designed to help students excel in their studies through collaborative learning, interactive quizzes, and personalized study tools.
              </p>
              
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Your feedback helps us improve and enhance the learning experience for all users.
              </p>
              
              <Link to="/dashboard" className={`inline-block py-2 px-4 rounded-md ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } transition duration-200`}>
                Return to Dashboard
              </Link>
            </div>
          </div>
          
          {/* Recent Reviews */}
          <div className="mt-12">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Reviews
            </h2>
            
            {loading ? (
              <div className="flex justify-center">
                <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-white' : 'border-gray-900'}`}></div>
              </div>
            ) : feedbackList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbackList.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {feedback.userName}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(feedback.createdAt)}
                        </p>
                      </div>
                      <StarRating rating={feedback.rating} />
                    </div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feedback.comment}</p>
                    
                    {/* Show delete button for user's own feedback */}
                    {user && user.id === feedback.userId && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleDeleteFeedback(feedback.id)}
                          className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-8 text-center rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}>
                <p className="mb-4">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Feedback; 