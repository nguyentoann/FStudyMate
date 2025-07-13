import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../services/config';
import { getUserId } from '../utils/userIdHelper';
import LoadingSpinner from './LoadingSpinner';

/**
 * LecturerFeedbackForm Component
 * 
 * Form phản hồi về giảng viên với dropdown chọn khoa/phòng và giảng viên
 * 
 * Props:
 * - onSuccess: Hàm callback khi gửi thành công
 */
function LecturerFeedbackForm({ onSuccess }) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // State cho các dropdown
    const [departments, setDepartments] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedLecturer, setSelectedLecturer] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Lấy danh sách khoa/phòng khi component được mount
    useEffect(() => {
        fetchDepartments();
    }, []);
    
    // Lấy danh sách giảng viên khi khoa/phòng thay đổi
    useEffect(() => {
        fetchLecturers(selectedDepartment);
    }, [selectedDepartment]);
    
    // Hàm lấy danh sách khoa/phòng
    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/lecturer-form/departments`);
            setDepartments(['all', ...response.data]);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('Không thể tải danh sách khoa/phòng');
        } finally {
            setLoading(false);
        }
    };
    
    // Hàm lấy danh sách giảng viên theo khoa/phòng
    const fetchLecturers = async (department) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/lecturer-form/lecturers?department=${department}`);
            setLecturers(response.data);
            setSelectedLecturer('');
        } catch (err) {
            console.error('Error fetching lecturers:', err);
            setError('Không thể tải danh sách giảng viên');
        } finally {
            setLoading(false);
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
        
        // Kiểm tra các trường bắt buộc
        if (!selectedLecturer) {
            setError('Vui lòng chọn giảng viên để gửi phản hồi');
            return;
        }
        
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
            
            const selectedLecturerObj = lecturers.find(lecturer => lecturer.lecturerId === selectedLecturer);
            
            const feedbackData = {
                content: content.trim(),
                rating: rating,
                type: 'LECTURER',
                targetId: selectedLecturer,
                userId: userId
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
            const response = await axios.post(
                `${API_URL}/feedbacks`, 
                feedbackData,
                { headers }
            );
            
            // Xử lý thành công
            setContent('');
            setRating(5);
            
            if (user) {
                setSuccess(`Phản hồi của bạn về giảng viên ${selectedLecturerObj?.fullName || selectedLecturer} đã được gửi thành công!`);
            } else {
                setSuccess(`Phản hồi ẩn danh của bạn về giảng viên ${selectedLecturerObj?.fullName || selectedLecturer} đã được gửi thành công!`);
            }
            
            // Gọi callback nếu được truyền vào
            if (onSuccess && typeof onSuccess === 'function') {
                onSuccess(response.data);
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Gửi phản hồi về giảng viên
            </h2>
            
            {loading && <LoadingSpinner size="sm" />}
            
            <form onSubmit={handleSubmit}>
                {/* Dropdown chọn khoa/phòng */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Chọn khoa/phòng
                    </label>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {departments.map((department) => (
                            <option key={department} value={department}>
                                {department === 'all' ? 'Tất cả khoa/phòng' : department}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Dropdown chọn giảng viên */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Chọn giảng viên
                    </label>
                    <select
                        value={selectedLecturer}
                        onChange={(e) => setSelectedLecturer(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={lecturers.length === 0}
                        required
                    >
                        <option value="">-- Chọn giảng viên --</option>
                        {lecturers.map((lecturer) => (
                            <option key={lecturer.lecturerId} value={lecturer.lecturerId}>
                                {lecturer.lecturerId} - {lecturer.fullName}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Hiển thị thông tin giảng viên đã chọn */}
                {selectedLecturer && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        {lecturers
                            .filter(lecturer => lecturer.lecturerId === selectedLecturer)
                            .map(lecturer => (
                                <div key={lecturer.lecturerId} className="flex items-start">
                                    {lecturer.profileImageUrl && (
                                        <img 
                                            src={lecturer.profileImageUrl} 
                                            alt={lecturer.fullName}
                                            className="w-16 h-16 rounded-full mr-3 object-cover"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-medium text-gray-800 dark:text-gray-200">
                                            {lecturer.fullName} ({lecturer.lecturerId})
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Khoa/phòng: {lecturer.department || 'Chưa cập nhật'}
                                        </p>
                                        {lecturer.specializations && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Chuyên môn: {lecturer.specializations}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}
                
                {/* Đánh giá sao */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Đánh giá
                    </label>
                    {renderStarRating()}
                </div>
                
                {/* Nội dung phản hồi */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nội dung phản hồi
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows="4"
                        placeholder="Nhập nội dung phản hồi của bạn..."
                        required
                    ></textarea>
                </div>
                
                {/* Hiển thị lỗi */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-md">
                        {error}
                    </div>
                )}
                
                {/* Hiển thị thành công */}
                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-md">
                        {success}
                    </div>
                )}
                
                {/* Nút gửi */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="inline-block animate-spin mr-2">⟳</span>
                                Đang gửi...
                            </>
                        ) : (
                            'Gửi phản hồi'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LecturerFeedbackForm; 