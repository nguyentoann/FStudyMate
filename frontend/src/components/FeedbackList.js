import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FeedbackService from '../services/feedbackService';
import FeedbackForm from './FeedbackForm';

const FeedbackList = () => {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      let data;
      
      if (user && user.role === 'admin') {
        // Admins can see all feedback
        data = await FeedbackService.getAllFeedback();
      } else if (user) {
        // Regular users can only see their own feedback
        data = await FeedbackService.getFeedbackByUserId(user.id);
      } else {
        // No user logged in
        setFeedbackList([]);
        return;
      }
      
      setFeedbackList(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Không thể tải phản hồi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [user]);

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) {
      try {
        await FeedbackService.deleteFeedback(id);
        // Remove from list
        setFeedbackList(feedbackList.filter(feedback => feedback.id !== id));
      } catch (err) {
        console.error('Error deleting feedback:', err);
        alert('Không thể xóa phản hồi. Vui lòng thử lại.');
      }
    }
  };

  const handleFormSuccess = () => {
    fetchFeedback();
    setEditingFeedback(null);
    setShowForm(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ';
      case 'REVIEWED':
        return 'Đã xem xét';
      case 'RESOLVED':
        return 'Đã giải quyết';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Phản hồi</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
          onClick={() => {
            setEditingFeedback(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Ẩn biểu mẫu' : 'Gửi phản hồi'}
        </button>
      </div>

      {showForm && (
        <FeedbackForm
          existingFeedback={editingFeedback}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setEditingFeedback(null);
            setShowForm(false);
          }}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600">Không có phản hồi nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {feedbackList.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{feedback.subject}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(feedback.status)}`}>
                  {getStatusText(feedback.status)}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{feedback.content}</p>
              
              {/* Star rating display */}
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-gray-600">({feedback.rating}/5)</span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  <p>Tạo lúc: {formatDate(feedback.createdAt)}</p>
                  {feedback.updatedAt && feedback.updatedAt !== feedback.createdAt && (
                    <p>Cập nhật lúc: {formatDate(feedback.updatedAt)}</p>
                  )}
                </div>
                
                {(user && (user.id === feedback.userId || user.role === 'admin')) && (
                  <div className="flex space-x-2">
                    {user.id === feedback.userId && feedback.status === 'PENDING' && (
                      <button
                        onClick={() => handleEdit(feedback)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Chỉnh sửa
                      </button>
                    )}
                    
                    {(user.id === feedback.userId || user.role === 'admin') && (
                      <button
                        onClick={() => handleDelete(feedback.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Xóa
                      </button>
                    )}
                    
                    {user.role === 'admin' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={async () => {
                            await FeedbackService.updateFeedbackStatus(feedback.id, 'REVIEWED');
                            fetchFeedback();
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          disabled={feedback.status === 'REVIEWED'}
                        >
                          Đánh dấu đã xem
                        </button>
                        
                        <button
                          onClick={async () => {
                            await FeedbackService.updateFeedbackStatus(feedback.id, 'RESOLVED');
                            fetchFeedback();
                          }}
                          className="text-green-500 hover:text-green-700"
                          disabled={feedback.status === 'RESOLVED'}
                        >
                          Đánh dấu đã giải quyết
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList; 