import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/config';
import LoadingSpinner from './LoadingSpinner';

/**
 * Component hiển thị chi tiết về phản hồi giảng viên
 * 
 * Props:
 * - feedback: Đối tượng phản hồi cần hiển thị
 */
function LecturerFeedbackDetails({ feedback }) {
    const [lecturerDetails, setLecturerDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Chỉ tải thông tin khi có feedback và feedback có targetId (lecturerId)
        if (feedback && feedback.type === 'LECTURER' && feedback.targetId) {
            fetchLecturerDetails(feedback.targetId);
        }
    }, [feedback]);

    const fetchLecturerDetails = async (lecturerId) => {
        try {
            setLoading(true);
            setError('');
            
            // Lấy thông tin chi tiết về giảng viên
            const response = await axios.get(`${API_URL}/lecturer-form/lecturers/${lecturerId}`);
            setLecturerDetails(response.data);
        } catch (err) {
            console.error('Error fetching lecturer details:', err);
            setError('Không thể tải thông tin chi tiết về giảng viên');
        } finally {
            setLoading(false);
        }
    };

    // Nếu không có feedback hoặc không phải loại LECTURER
    if (!feedback || feedback.type !== 'LECTURER') {
        return null;
    }

    // Nếu đã có thông tin giảng viên trong feedback, hiển thị nó
    if (feedback.lecturerFullName || feedback.lecturerDepartment) {
        return (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                <p><span className="font-semibold">Giảng viên:</span> {feedback.lecturerFullName} ({feedback.lecturerId})</p>
                {feedback.lecturerDepartment && (
                    <p><span className="font-semibold">Khoa/phòng:</span> {feedback.lecturerDepartment}</p>
                )}
                {feedback.lecturerSpecializations && (
                    <p><span className="font-semibold">Chuyên môn:</span> {feedback.lecturerSpecializations}</p>
                )}
            </div>
        );
    }

    return (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {loading && <LoadingSpinner size="sm" />}
            
            {error && <p className="text-red-500">{error}</p>}
            
            {!loading && !error && lecturerDetails && (
                <div>
                    <p><span className="font-semibold">Giảng viên:</span> {lecturerDetails.fullName} ({lecturerDetails.lecturerId})</p>
                    {lecturerDetails.department && (
                        <p><span className="font-semibold">Khoa/phòng:</span> {lecturerDetails.department}</p>
                    )}
                    {lecturerDetails.specializations && (
                        <p><span className="font-semibold">Chuyên môn:</span> {lecturerDetails.specializations}</p>
                    )}
                </div>
            )}
            
            {!loading && !error && !lecturerDetails && (
                <p><span className="font-semibold">Giảng viên ID:</span> {feedback.targetId}</p>
            )}
        </div>
    );
}

export default LecturerFeedbackDetails; 