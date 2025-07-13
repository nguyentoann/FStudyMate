import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/config';
import LoadingSpinner from './LoadingSpinner';

/**
 * Component hiển thị chi tiết về phản hồi bài học
 * 
 * Props:
 * - feedback: Đối tượng phản hồi cần hiển thị
 */
function FeedbackDetails({ feedback }) {
    const [lessonDetails, setLessonDetails] = useState(null);
    const [subjectDetails, setSubjectDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Chỉ tải thông tin khi có feedback và feedback có lessonId
        if (feedback && feedback.lessonId) {
            fetchLessonDetails(feedback.lessonId);
        }
    }, [feedback]);

    const fetchLessonDetails = async (lessonId) => {
        try {
            setLoading(true);
            setError('');
            
            // Lấy thông tin chi tiết về bài học
            const response = await axios.get(`${API_URL}/feedback-form/lessons/${lessonId}`);
            setLessonDetails(response.data);
            
            // Nếu có subjectId, lấy thông tin về môn học
            if (response.data.subjectId) {
                const subjectResponse = await axios.get(`${API_URL}/feedback-form/subjects?id=${response.data.subjectId}`);
                if (subjectResponse.data && subjectResponse.data.length > 0) {
                    setSubjectDetails(subjectResponse.data[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching lesson details:', err);
            setError('Không thể tải thông tin chi tiết về bài học');
        } finally {
            setLoading(false);
        }
    };

    // Nếu không có feedback hoặc không phải loại LESSON
    if (!feedback || feedback.type !== 'LESSON') {
        return null;
    }

    return (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {loading && <LoadingSpinner size="sm" />}
            
            {error && <p className="text-red-500">{error}</p>}
            
            {!loading && !error && (
                <div>
                    {lessonDetails && (
                        <p><span className="font-semibold">Bài học:</span> {lessonDetails.title}</p>
                    )}
                    
                    {subjectDetails && (
                        <>
                            <p><span className="font-semibold">Môn học:</span> {subjectDetails.name}</p>
                            <p><span className="font-semibold">Kỳ học:</span> {subjectDetails.termNo}</p>
                        </>
                    )}
                    
                    {!lessonDetails && !subjectDetails && (
                        <p className="italic">Không có thông tin chi tiết</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default FeedbackDetails; 