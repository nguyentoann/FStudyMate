import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FeedbackList from '../../components/FeedbackList';
import FeedbackForm from '../../components/FeedbackForm';
import FeedbackService from '../../services/feedbackService';
import DashboardLayout from '../../components/DashboardLayout';

const FeedbackPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'new'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Only fetch statistics for admin
    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const statistics = await FeedbackService.getFeedbackStatistics();
      setStats(statistics);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatistics = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-800 mb-1">Tổng số phản hồi</h3>
          <p className="text-2xl font-bold text-blue-700">{stats.totalFeedback || 0}</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-100">
          <h3 className="text-sm font-semibold text-yellow-800 mb-1">Đang chờ xử lý</h3>
          <p className="text-2xl font-bold text-yellow-700">{stats.pendingFeedback || 0}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-100">
          <h3 className="text-sm font-semibold text-green-800 mb-1">Đã giải quyết</h3>
          <p className="text-2xl font-bold text-green-700">{stats.resolvedFeedback || 0}</p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Trung tâm phản hồi</h1>
          <p className="text-gray-600 mb-4">
            Chúng tôi đánh giá cao phản hồi của bạn! Vui lòng sử dụng trang này để gửi bất kỳ nhận xét, đề xuất hoặc vấn đề bạn gặp phải.
          </p>
          
          {user && user.role === 'admin' && renderStatistics()}
          
          <div className="border-b border-gray-200 mb-6">
            <div className="flex -mb-px">
              <button
                className={`mr-4 py-2 px-4 font-medium text-sm ${
                  activeTab === 'view'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('view')}
              >
                Xem phản hồi
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === 'new'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('new')}
              >
                Gửi phản hồi mới
              </button>
            </div>
          </div>
          
          {activeTab === 'view' ? (
            <FeedbackList />
          ) : (
            <FeedbackForm onSuccess={() => setActiveTab('view')} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FeedbackPage; 