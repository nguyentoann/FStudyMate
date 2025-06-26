import React, { useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import FeedbackService from '../services/feedbackService';

const FeedbackForm = ({ onSuccess, existingFeedback = null }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState(existingFeedback ? existingFeedback.subject : '');
  const [content, setContent] = useState(existingFeedback ? existingFeedback.content : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      if (existingFeedback) {
        // Update existing feedback
        await FeedbackService.updateFeedback(existingFeedback.id, {
          subject,
          content
        });
        setSuccessMessage('Feedback updated successfully!');
      } else {
        // Create new feedback
        await FeedbackService.createFeedback({
          userId: user.id,
          subject,
          content
        });
        setSuccessMessage('Feedback submitted successfully!');
        // Clear form after successful submission
        setSubject('');
        setContent('');
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {existingFeedback ? 'Edit Feedback' : 'Submit Feedback'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
            Feedback
          </label>
          <textarea
            id="content"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your feedback"
            rows="5"
            required
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm; 