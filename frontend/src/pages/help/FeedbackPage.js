import React from 'react';
import { useAuth } from '../../context/AuthContext';
import FeedbackList from '../../components/FeedbackList';
import DashboardLayout from '../../components/DashboardLayout';

const FeedbackPage = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Trung tâm phản hồi</h1>
          <p className="text-gray-600 mb-2">
            Chúng tôi đánh giá cao phản hồi của bạn! Vui lòng sử dụng trang này để gửi bất kỳ nhận xét, đề xuất hoặc vấn đề bạn gặp phải.
          </p>
          {user && user.role === 'admin' && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-blue-700">
                <strong>Chế độ quản trị viên:</strong> Bạn có thể xem và quản lý tất cả phản hồi từ người dùng.
              </p>
            </div>
          )}
        </div>
        
        <FeedbackList />
      </div>
    </DashboardLayout>
  );
};

export default FeedbackPage; 