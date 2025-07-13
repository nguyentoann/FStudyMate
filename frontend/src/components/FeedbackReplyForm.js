import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../services/config';
import { getUserId } from '../utils/userIdHelper';
import FeedbackService from '../services/feedbackService';

/**
 * Component form để tạo reply cho một feedback hoặc reply cho một reply khác
 * 
 * Props:
 * - feedbackId: ID của feedback cần reply
 * - parentReplyId: ID của reply cha (nếu là nested reply)
 * - replyToUser: Tên người dùng đang được reply (hiển thị trong placeholder)
 * - onSuccess: Hàm callback khi gửi thành công
 * - isCollapsed: Boolean để xác định form có đang thu gọn hay không
 * - onToggle: Hàm callback khi toggle form
 */
function FeedbackReplyForm({ feedbackId, parentReplyId, replyToUser, onSuccess, isCollapsed = true, onToggle }) {
    console.log(`FeedbackReplyForm rendered for feedback ID: ${feedbackId}, isCollapsed: ${isCollapsed}`);
    
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // Update the handleSubmit function to enhance user information directly
    // if the user is logged in, we already have their information
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra nội dung
        if (content.trim().length < 2) {
            setError('Nội dung phản hồi phải có ít nhất 2 ký tự');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        
        try {
            // Lấy userId từ localStorage nếu có
            let userId = getUserId();
            
            const replyData = {
                feedbackId: feedbackId,
                parentReplyId: parentReplyId,
                content: content.trim(),
                userId: userId
            };
            
            console.log('Submitting reply data:', replyData);
            
            // Use FeedbackService instead of direct axios calls
            let response;
            if (parentReplyId) {
                response = await FeedbackService.createNestedReply(parentReplyId, replyData);
            } else {
                response = await FeedbackService.createReply(replyData);
            }
            
            console.log('Reply created successfully:', response);
            
            // Xử lý thành công
            setContent('');
            
            // Nếu người dùng đã đăng nhập, chúng ta có thể bổ sung thông tin người dùng vào phản hồi
            // để tránh phải tải lại dữ liệu
            if (user && response) {
                const enhancedReply = {
                    ...response,
                    userFullName: user.fullName || response.userFullName,
                    userRole: user.role || response.userRole,
                    userProfileImage: user.profileImageUrl || response.userProfileImage
                };
                
                // Gọi callback với dữ liệu đã được bổ sung
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(enhancedReply);
                }
            } else if (response && response.id) {
                // Nếu không có thông tin người dùng, tải lại dữ liệu từ server
                try {
                    // Lấy thông tin chi tiết của reply vừa tạo
                    const replyId = response.id;
                    const repliesData = await FeedbackService.getRepliesByFeedbackId(feedbackId);
                    
                    // Tìm reply vừa tạo trong danh sách
                    const updatedReply = repliesData.find(reply => reply.id === replyId) || 
                                    repliesData.flatMap(reply => 
                                        reply.childReplies?.filter(child => child.id === replyId) || []
                                    )[0];
                    
                    // Nếu tìm thấy, sử dụng thông tin đầy đủ
                    if (updatedReply) {
                        console.log("Found complete reply data:", updatedReply);
                        // Gọi callback với thông tin đầy đủ
                        if (onSuccess && typeof onSuccess === 'function') {
                            onSuccess(updatedReply);
                        }
                    } else {
                        // Nếu không tìm thấy, sử dụng thông tin ban đầu
                        if (onSuccess && typeof onSuccess === 'function') {
                            onSuccess(response);
                        }
                    }
                } catch (fetchErr) {
                    console.error('Error fetching complete reply data:', fetchErr);
                    // Vẫn gọi callback với dữ liệu ban đầu nếu có lỗi
                    if (onSuccess && typeof onSuccess === 'function') {
                        onSuccess(response);
                    }
                }
            } else {
                // Gọi callback với dữ liệu ban đầu
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(response);
                }
            }
            
            // Thu gọn form sau khi gửi thành công
            if (onToggle) {
                onToggle();
            }
        } catch (err) {
            console.error('Error submitting reply:', err);
            
            setError(
                err.response?.data?.error || err.response?.data?.message || 
                'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Tạo placeholder text dựa trên việc có đang trả lời ai không
    const getPlaceholderText = () => {
        if (replyToUser) {
            return `Trả lời ${replyToUser}...`;
        }
        return "Nhập nội dung trả lời...";
    };
    
    // Nếu form đang thu gọn, chỉ hiển thị nút để mở rộng
    if (isCollapsed) {
        return (
            <div className="mt-2">
                <button
                    onClick={() => {
                        console.log('Toggle button clicked, expanding form');
                        onToggle();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    {replyToUser ? `Trả lời ${replyToUser}` : 'Trả lời'}
                </button>
            </div>
        );
    }
    
    return (
        <div className="mt-2 pt-2">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows="3"
                        placeholder={getPlaceholderText()}
                        required
                        autoFocus
                    ></textarea>
                </div>
                
                {/* Hiển thị lỗi */}
                {error && (
                    <div className="mb-3 p-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-md text-sm">
                        {error}
                    </div>
                )}
                
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={() => {
                            console.log('Cancel button clicked, collapsing form');
                            onToggle();
                        }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FeedbackReplyForm; 