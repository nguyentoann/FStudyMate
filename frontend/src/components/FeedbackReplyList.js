import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../services/config';
import LoadingSpinner from './LoadingSpinner';
import FeedbackReplyForm from './FeedbackReplyForm';
import FeedbackService from '../services/feedbackService';

/**
 * Component hiển thị danh sách các replies cho một feedback
 * 
 * Props:
 * - feedbackId: ID của feedback cần hiển thị replies
 * - onReplyAdded: Hàm callback khi có reply mới được thêm vào
 */
function FeedbackReplyList({ feedbackId, onReplyAdded }) {
    console.log(`FeedbackReplyList rendered for feedback ID: ${feedbackId}`);
    
    const { user } = useAuth();
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReplyForm, setShowReplyForm] = useState(true); // Set to true by default for better usability
    const [replyingTo, setReplyingTo] = useState(null); // { id, userName } for nested replies
    const [editingReply, setEditingReply] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const dropdownRefs = useRef({});
    
    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (activeDropdown !== null) {
                const currentRef = dropdownRefs.current[activeDropdown];
                if (currentRef && !currentRef.contains(event.target)) {
                    console.log('Closing dropdown - clicked outside');
                    setActiveDropdown(null);
                }
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);
    
    // Update the useEffect to ensure data is refreshed when needed
    useEffect(() => {
        if (feedbackId) {
            fetchReplies();
        }
    }, [feedbackId]);

    // Add a function to force refresh data
    const refreshReplies = () => {
        if (feedbackId) {
            fetchReplies();
        }
    };
    
    const fetchReplies = async () => {
        if (!feedbackId) return;
        
        try {
            setLoading(true);
            setError('');
            
            // Use FeedbackService instead of direct axios call
            const data = await FeedbackService.getRepliesByFeedbackId(feedbackId);
            setReplies(data);
        } catch (err) {
            console.error('Error fetching replies:', err);
            setError('Không thể tải các phản hồi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    // Update the handleReplySuccess function to refresh data if needed
    const handleReplySuccess = (newReply) => {
        // Check if the reply has all necessary user information
        const hasCompleteUserInfo = newReply.userFullName && newReply.userRole;
        
        // If the reply doesn't have complete user info, refresh all replies
        if (!hasCompleteUserInfo) {
            console.log("Reply missing user info, refreshing all replies");
            fetchReplies();
            return;
        }
        
        // If reply has complete info, proceed with normal update
        // Nếu là reply cấp cao nhất
        if (!newReply.parentReplyId) {
            setReplies(prevReplies => [...prevReplies, newReply]);
        } else {
            // Nếu là nested reply, cần cập nhật cây replies
            setReplies(prevReplies => {
                return prevReplies.map(reply => {
                    if (reply.id === newReply.parentReplyId) {
                        // Thêm vào childReplies của parent
                        return {
                            ...reply,
                            childReplies: [...(reply.childReplies || []), newReply]
                        };
                    }
                    return reply;
                });
            });
        }
        
        // Reset replyingTo state
        setReplyingTo(null);
        
        // Gọi callback nếu được truyền vào
        if (onReplyAdded && typeof onReplyAdded === 'function') {
            onReplyAdded(newReply);
        }
    };
    
    const handleDeleteReply = async (replyId) => {
        console.log(`Delete button clicked for reply ID: ${replyId}`);
        
        if (!window.confirm('Bạn có chắc chắn muốn xóa phản hồi này không?')) {
            return;
        }
        
        try {
            console.log(`Attempting to delete reply ID: ${replyId}`);
            
            // Use FeedbackService instead of direct axios call
            await FeedbackService.deleteReply(replyId);
            
            console.log(`Reply ID: ${replyId} deleted successfully`);
            
            // Cập nhật danh sách replies sau khi xóa
            setReplies(prevReplies => {
                // Xóa reply cấp cao nhất
                const filteredReplies = prevReplies.filter(reply => reply.id !== replyId);
                
                // Xóa nested reply
                return filteredReplies.map(reply => {
                    if (reply.childReplies && reply.childReplies.length > 0) {
                        return {
                            ...reply,
                            childReplies: reply.childReplies.filter(child => child.id !== replyId)
                        };
                    }
                    return reply;
                });
            });
            
            // Close dropdown
            setActiveDropdown(null);
        } catch (err) {
            console.error('Error deleting reply:', err);
            
            // Provide more specific error message based on the error
            let errorMessage = 'Không thể xóa phản hồi. Vui lòng thử lại sau.';
            
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Bạn cần đăng nhập để xóa phản hồi.';
                } else if (err.response.status === 403) {
                    errorMessage = 'Bạn không có quyền xóa phản hồi này.';
                } else if (err.response.data && err.response.data.error) {
                    errorMessage = err.response.data.error;
                }
            }
            
            alert(errorMessage);
        }
    };
    
    const handleEditReply = (reply) => {
        console.log(`Edit button clicked for reply ID: ${reply.id}`);
        setEditingReply(reply);
        setEditContent(reply.content);
        setActiveDropdown(null);
    };
    
    const handleSaveEdit = async () => {
        if (!editingReply) return;
        
        if (editContent.trim().length < 2) {
            alert('Nội dung phản hồi phải có ít nhất 2 ký tự');
            return;
        }
        
        try {
            console.log(`Saving edit for reply ID: ${editingReply.id}`);
            // Call API to update reply content
            const updatedReply = await FeedbackService.updateReply(editingReply.id, {
                content: editContent.trim(),
                feedbackId: editingReply.feedbackId // Include the feedbackId
            });
            
            // Update the replies list
            setReplies(prevReplies => {
                // Update top-level reply
                const updatedReplies = prevReplies.map(reply => 
                    reply.id === editingReply.id 
                        ? { ...reply, content: editContent.trim() } 
                        : reply
                );
                
                // Update nested reply if needed
                return updatedReplies.map(reply => {
                    if (reply.childReplies && reply.childReplies.length > 0) {
                        return {
                            ...reply,
                            childReplies: reply.childReplies.map(child => 
                                child.id === editingReply.id
                                    ? { ...child, content: editContent.trim() }
                                    : child
                            )
                        };
                    }
                    return reply;
                });
            });
            
            // Reset editing state
            setEditingReply(null);
            setEditContent('');
        } catch (err) {
            console.error('Error updating reply:', err);
            
            // Provide more specific error message based on the error response
            let errorMessage = 'Không thể cập nhật phản hồi. Vui lòng thử lại sau.';
            
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Bạn cần đăng nhập để cập nhật phản hồi.';
                } else if (err.response.status === 403) {
                    errorMessage = 'Bạn không có quyền cập nhật phản hồi này.';
                } else if (err.response.data && err.response.data.error) {
                    errorMessage = err.response.data.error;
                }
            }
            
            alert(errorMessage);
        }
    };
    
    const handleCancelEdit = () => {
        setEditingReply(null);
        setEditContent('');
    };
    
    const toggleReplyForm = (replyInfo = null) => {
        console.log('Toggle reply form called:', replyInfo ? `Replying to ${replyInfo.userName}` : 'Toggle main form');
        if (replyInfo) {
            setReplyingTo(replyInfo);
            setShowReplyForm(true);
            console.log('Set replyingTo:', replyInfo, 'and showReplyForm: true');
        } else {
            setReplyingTo(null);
            setShowReplyForm(!showReplyForm);
            console.log('Set replyingTo: null and toggled showReplyForm to:', !showReplyForm);
        }
    };
    
    const toggleDropdown = (replyId) => {
        console.log(`Toggle dropdown for reply ID: ${replyId}, current active: ${activeDropdown}`);
        setActiveDropdown(activeDropdown === replyId ? null : replyId);
    };
    
    // Format thời gian
    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };
    
    // Kiểm tra xem người dùng có quyền xóa reply không
    const canDeleteReply = (reply) => {
        if (!user) return false;
        const isAdmin = user.role === 'admin';
        const isOwner = user.id === reply.createdBy;
        return isAdmin || isOwner;
    };
    
    // Kiểm tra xem người dùng có quyền sửa reply không
    const canEditReply = (reply) => {
        if (!user) return false;
        // Only the owner can edit their reply
        return user.id === reply.createdBy;
    };
    
    // Chuyển đổi role thành văn bản hiển thị
    const getRoleDisplay = (role) => {
        if (!role) return null;
        
        const roleMap = {
            'admin': 'Quản trị viên',
            'lecturer': 'Giảng viên',
            'student': 'Sinh viên',
            'guest': 'Khách'
        };
        
        return roleMap[role.toLowerCase()] || role;
    };
    
    // Lấy màu sắc cho role badge
    const getRoleBadgeColor = (role) => {
        if (!role) return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        
        const roleColorMap = {
            'admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            'lecturer': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'student': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'guest': 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        };
        
        return roleColorMap[role.toLowerCase()] || 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    };
    
    // Render một reply và các nested replies của nó
    const renderReply = (reply) => {
        const roleDisplay = getRoleDisplay(reply.userRole);
        const roleBadgeColor = getRoleBadgeColor(reply.userRole);
        const isEditing = editingReply && editingReply.id === reply.id;
        const showDropdown = canDeleteReply(reply) || canEditReply(reply);
        
        return (
            <div 
                key={reply.id} 
                className="pl-3 border-l-2 border-gray-300 dark:border-gray-700 mb-3"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <img 
                            src={reply.userProfileImage || '/images/default-avatar.svg'} 
                            alt={reply.userFullName || 'Người dùng ẩn danh'} 
                            className="w-8 h-8 rounded-full mr-2 object-cover"
                        />
                        <div>
                            <div className="flex items-center flex-wrap gap-1">
                                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                    {reply.userFullName || 'Người dùng ẩn danh'}
                                </span>
                                
                                {roleDisplay && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadgeColor}`}>
                                        {roleDisplay}
                                    </span>
                                )}
                                
                                {!reply.createdBy && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                        Ẩn danh
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDateTime(reply.createdAt)}
                            </span>
                        </div>
                    </div>
                    
                    {showDropdown && (
                        <div 
                            className="relative" 
                            ref={el => dropdownRefs.current[reply.id] = el}
                        >
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown(reply.id);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
                                title="Tùy chọn"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                            
                            {activeDropdown === reply.id && (
                                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1">
                                    {canEditReply(reply) && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditReply(reply);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Sửa
                                        </button>
                                    )}
                                    {canDeleteReply(reply) && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteReply(reply.id);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {isEditing ? (
                    <div className="mt-2 pl-10">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            rows="3"
                            placeholder="Nhập nội dung phản hồi..."
                        ></textarea>
                        
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-1 text-gray-700 dark:text-gray-300 text-sm pl-10">
                        {reply.replyToUserName && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium mr-1">
                                @{reply.replyToUserName}
                            </span>
                        )}
                        {reply.content}
                    </div>
                )}
                
                {!isEditing && (
                    <div className="ml-10 mt-1">
                        <button
                            onClick={() => toggleReplyForm({ id: reply.id, userName: reply.userFullName })}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Trả lời
                        </button>
                    </div>
                )}
                
                {/* Show nested reply form if this is the reply being replied to */}
                {replyingTo && replyingTo.id === reply.id && (
                    <div className="ml-10 mt-1">
                        <FeedbackReplyForm 
                            feedbackId={feedbackId}
                            parentReplyId={reply.id}
                            replyToUser={replyingTo.userName}
                            onSuccess={handleReplySuccess}
                            isCollapsed={false}
                            onToggle={() => toggleReplyForm(null)}
                        />
                    </div>
                )}
                
                {/* Render nested replies */}
                {reply.childReplies && reply.childReplies.length > 0 && (
                    <div className="ml-8 mt-2">
                        {reply.childReplies.map(childReply => renderReply(childReply))}
                    </div>
                )}
            </div>
        );
    };
    
    if (loading) {
        return <LoadingSpinner size="sm" />;
    }
    
    if (error) {
        return <p className="text-red-500 text-sm">{error}</p>;
    }
    
    return (
        <div className="mt-4">
            {console.log('FeedbackReplyList render - replies:', replies.length, 'replyingTo:', replyingTo, 'showReplyForm:', showReplyForm)}
            
            {/* Show existing replies if any */}
            {replies.length > 0 && (
                <div className="border-t dark:border-gray-700 pt-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phản hồi ({replies.length})
                    </h3>
                    
                    <div className="space-y-4">
                        {replies.map(reply => renderReply(reply))}
                    </div>
                </div>
            )}
            
            {/* Always show the main reply form */}
            <div className={replies.length > 0 ? "mt-4 border-t dark:border-gray-700 pt-3" : "mt-3 border-t dark:border-gray-700 pt-3"}>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {replies.length > 0 ? "Thêm phản hồi mới" : "Phản hồi đầu tiên"}
                </h3>
                
                {!replyingTo && (
                    <FeedbackReplyForm 
                        feedbackId={feedbackId}
                        onSuccess={handleReplySuccess}
                        isCollapsed={!showReplyForm}
                        onToggle={toggleReplyForm}
                    />
                )}
                
                {/* Show nested reply form if replying to a specific comment */}
                {replyingTo && (
                    <div className="ml-4 mt-2 border-l-2 border-gray-300 dark:border-gray-700 pl-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Đang trả lời <span className="font-medium">{replyingTo.userName}</span>
                        </p>
                        <FeedbackReplyForm 
                            feedbackId={feedbackId}
                            parentReplyId={replyingTo.id}
                            replyToUser={replyingTo.userName}
                            onSuccess={handleReplySuccess}
                            isCollapsed={false}
                            onToggle={() => toggleReplyForm(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default FeedbackReplyList; 