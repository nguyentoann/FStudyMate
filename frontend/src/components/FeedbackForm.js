import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../services/config';
import { useNavigate } from 'react-router-dom';
import { getUserId } from '../utils/userIdHelper';

/**
 * Feedback Form Component
 * 
 * Cho phép người dùng gửi feedback cho một đối tượng cụ thể.
 * 
 * Props:
 * - type: Loại feedback (LESSON, LECTURER, SYSTEM, USER)
 * - targetId: ID của đối tượng được gửi feedback
 * - targetName: Tên của đối tượng (để hiển thị thân thiện với người dùng)
 * - onSuccess: Hàm callback khi gửi thành công
 */
function FeedbackForm({ type, targetId, targetName, onSuccess }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5); // Default rating is 5 stars
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Hiển thị phù hợp với loại feedback
    const getFormTitle = () => {
        switch (type) {
            case 'LESSON':
                return `Gửi phản hồi về bài học: ${targetName || targetId}`;
            case 'LECTURER':
                return `Gửi phản hồi về giảng viên: ${targetName || targetId}`;
            case 'SYSTEM':
                return 'Gửi phản hồi về hệ thống';
            case 'USER':
                return `Gửi phản hồi về người dùng: ${targetName || targetId}`;
            default:
                return 'Gửi phản hồi';
        }
    };
    
    // Render component đánh giá sao
    const renderStarRating = () => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                    >
                        <svg
                            className={`w-8 h-8 ${
                                star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                ))}
                <span className="ml-2 text-gray-700 dark:text-gray-300">{rating}/5</span>
            </div>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra nội dung
        if (content.trim().length < 10) {
            setError('Nội dung phản hồi phải có ít nhất 10 ký tự');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        setSuccess('');
        
        try {
            // Lấy userId từ localStorage nếu có
            let userId = getUserId();
            console.log('Retrieved userId for feedback submission:', userId);
            
            // Tạo feedback request object
            const feedbackData = {
                content: content.trim(),
                rating: rating,
                type: type,
                targetId: targetId,
                userId: userId // Thêm userId vào request
            };
            
            // Chuẩn bị headers
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Thêm token xác thực nếu người dùng đã đăng nhập
            if (user && user.token) {
                headers['Authorization'] = `Bearer ${user.token}`;
            }
            
            // Gửi request đến API
            console.log('Sending feedback request to API:', `${API_URL}/feedbacks`);
            console.log('Feedback data:', feedbackData);
            console.log('Headers:', headers);
            
            const response = await axios.post(
                `${API_URL}/feedbacks`, 
                feedbackData,
                { headers }
            );
            
            console.log('Feedback response:', response.data);
            const newFeedback = response.data;
            
            // Xử lý thành công
            setContent('');
            setRating(5); // Reset về 5 sao mặc định
            
            if (user) {
                setSuccess('Phản hồi của bạn đã được gửi thành công!');
            } else {
                setSuccess('Phản hồi ẩn danh của bạn đã được gửi thành công!');
            }
            
            // Gọi callback nếu được truyền vào
            if (onSuccess && typeof onSuccess === 'function') {
                console.log('Calling onSuccess callback with new feedback:', newFeedback);
                onSuccess(newFeedback);
            }
        } catch (err) {
            console.error('Error submitting feedback:', err);
            
            setError(
                err.response?.data?.error || err.response?.data?.message || 
                'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                {getFormTitle()}
            </h2>
            
            {!user && (
                <div className="p-4 mb-4 bg-blue-100 text-blue-700 rounded-md">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd"></path>
                        </svg>
                        <span>
                            Bạn đang gửi phản hồi với tư cách <strong>ẩn danh</strong>. 
                            <span 
                                className="font-bold cursor-pointer text-blue-600 ml-1 underline" 
                                onClick={() => navigate('/login')}
                            >
                                Đăng nhập
                            </span> để gửi phản hồi với tên của bạn.
                        </span>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Đánh giá của bạn:
                    </label>
                    {renderStarRating()}
                </div>
                
                <div className="mb-4">
                    <textarea
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows="5"
                        placeholder="Nhập nội dung phản hồi của bạn..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isSubmitting}
                    />
                    
                    {error && (
                        <p className="text-red-500 mt-1 text-sm">{error}</p>
                    )}
                </div>
                
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang gửi...' : user ? 'Gửi phản hồi' : 'Gửi phản hồi ẩn danh'}
                    </button>
                </div>
                
                {success && (
                    <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                        {success}
                    </div>
                )}
            </form>
        </div>
    );
}

export default FeedbackForm; 