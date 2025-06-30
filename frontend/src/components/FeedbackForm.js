import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FeedbackService from '../services/feedbackService';

const FeedbackForm = ({ onSuccess, existingFeedback = null, onCancel }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState(existingFeedback ? existingFeedback.subject : '');
  const [content, setContent] = useState(existingFeedback ? existingFeedback.content : '');
  const [rating, setRating] = useState(existingFeedback ? existingFeedback.rating : 5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !content.trim()) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      if (existingFeedback) {
        // Update existing feedback
        const updateData = {
          subject,
          content,
          rating
        };
        console.log('Updating feedback with data:', updateData);
        await FeedbackService.updateFeedback(existingFeedback.id, updateData);
        setSuccessMessage('Đã cập nhật phản hồi thành công!');
      } else {
        // Create new feedback
        const newFeedback = {
          userId: user.id,
          subject,
          content,
          rating
        };
        console.log('Creating new feedback with data:', newFeedback);
        console.log('User object:', user);
        await FeedbackService.createFeedback(newFeedback);
        setSuccessMessage('Đã gửi phản hồi thành công!');
        // Clear form after successful submission
        setSubject('');
        setContent('');
        setRating(5);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Không thể gửi phản hồi. Vui lòng thử lại.');
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

  // Render star rating
  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className={`text-2xl focus:outline-none ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {existingFeedback ? 'Chỉnh Sửa Phản Hồi' : 'Gửi Phản Hồi'}
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
            Tiêu đề
          </label>
          <input
            type="text"
            id="subject"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Nhập tiêu đề"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
            Nội dung phản hồi
          </label>
          <textarea
            id="content"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung phản hồi của bạn"
            rows="5"
            required
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Đánh giá
          </label>
          <div className="flex items-center">
            {renderStarRating()}
            <span className="ml-2 text-gray-600">({rating}/5)</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Hủy
            </button>
          )}
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : existingFeedback ? 'Cập nhật' : 'Gửi phản hồi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm; 