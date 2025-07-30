import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../services/config";
import LoadingSpinner from "./LoadingSpinner";
import FeedbackDetails from "./FeedbackDetails";
import LecturerFeedbackDetails from "./LecturerFeedbackDetails";
import FeedbackReplyList from "./FeedbackReplyList";
import FeedbackService from "../services/feedbackService";

/**
 * Feedback List Component
 *
 * Hiển thị danh sách các feedback cho một đối tượng cụ thể.
 *
 * Props:
 * - type: Loại feedback (LESSON, LECTURER, SYSTEM, USER)
 * - targetId: ID của đối tượng cần xem feedback
 * - lessonId: ID của bài học (chỉ sử dụng khi type là LESSON)
 * - showTitle: Có hiển thị tiêu đề hay không (mặc định: true)
 * - maxItems: Số lượng tối đa feedback hiển thị (mặc định: hiển thị tất cả)
 * - requireAuth: Có yêu cầu đăng nhập để xem không (mặc định: false)
 * - key: Prop used to force refresh (managed internally by React)
 */
function FeedbackList({
  type,
  targetId,
  lessonId,
  showTitle = true,
  maxItems,
  requireAuth = false,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (activeDropdown !== null) {
        const currentRef = dropdownRefs.current[activeDropdown];
        if (currentRef && !currentRef.contains(event.target)) {
          console.log("Closing dropdown - clicked outside");
          setActiveDropdown(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {};
        if (user && user.token) {
          headers["Authorization"] = `Bearer ${user.token}`;
        }

        let url = `${API_URL}/feedbacks`;
        const params = new URLSearchParams();

        if (type) {
          params.append("type", type);
        }

        if (lessonId) {
          params.append("lessonId", lessonId);
        } else if (targetId) {
          params.append("targetId", targetId);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        console.log("Fetching feedbacks from:", url);
        const response = await axios.get(url, { headers });

        console.log("Fetched feedbacks:", response.data);
        setFeedbacks(response.data);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);

        if (err.response && err.response.status === 401) {
          setError("Bạn cần đăng nhập để xem phản hồi.");
        } else {
          setError(
            err.response?.data?.error ||
              "Không thể tải danh sách phản hồi. Vui lòng thử lại sau."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    // Kiểm tra nếu cần đăng nhập nhưng chưa đăng nhập
    if (requireAuth && !user) {
      setError("Bạn cần đăng nhập để xem phản hồi.");
      setLoading(false);
      return;
    }

    console.log(
      `Fetching feedbacks: type=${type}, targetId=${targetId}, lessonId=${lessonId}`
    );
    fetchFeedbacks();

    // The component will re-fetch when any of these dependencies change
    // Note: React's key prop is handled internally and doesn't need to be in the dependency array
  }, [type, targetId, lessonId, user, requireAuth]);

  // Format date
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Render star rating
  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
          {rating}/5
        </span>
      </div>
    );
  };

  // Hiển thị tiêu đề phù hợp với loại feedback
  const getTitle = () => {
    switch (type) {
      case "LESSON":
        return "Feedback on the lesson";
      case "LECTURER":
        return "Feedback on the instructor";
      case "SYSTEM":
        return "Feedback on the system";
      case "USER":
        return "Feedback on the user";
      default:
        return "Feedback";
    }
  };

  // Hiển thị thông báo khi không có phản hồi
  const renderNoFeedbackMessage = () => {
    switch (type) {
      case "LESSON":
        return "No feedback on the lesson yet.";
      case "LECTURER":
        return "No feedback on the instructor yet.";
      case "SYSTEM":
        return "No feedback on the system yet.";
      case "USER":
        return "No feedback on the user yet.";
      default:
        return "No feedback yet.";
    }
  };

  // Xử lý khi có reply mới được thêm vào
  const handleReplyAdded = (feedbackId) => {
    console.log(`Reply added to feedback ID: ${feedbackId}`);

    // Cập nhật replyCount cho feedback tương ứng
    setFeedbacks((prevFeedbacks) =>
      prevFeedbacks.map((feedback) =>
        feedback.id === feedbackId
          ? { ...feedback, replyCount: (feedback.replyCount || 0) + 1 }
          : feedback
      )
    );

    // Refresh the feedbacks list to ensure UI is in sync with server
    // This is optional since we already updated the local state
    setTimeout(refreshFeedbacks, 300);
  };

  // Toggle hiển thị replies cho một feedback
  const toggleReplies = (feedbackId) => {
    console.log(
      `Toggle replies for feedback ID: ${feedbackId}, current expanded: ${expandedFeedback}`
    );
    if (expandedFeedback === feedbackId) {
      console.log("Collapsing feedback replies");
      setExpandedFeedback(null);
    } else {
      console.log("Expanding feedback replies");
      setExpandedFeedback(feedbackId);
    }
  };

  // Trong component FeedbackItem, cập nhật cách hiển thị số lượng replies
  const countTotalReplies = (replies) => {
    if (!replies || replies.length === 0) return 0;

    let total = replies.length;

    // Đếm thêm các nested replies
    replies.forEach((reply) => {
      if (reply.childReplies && reply.childReplies.length > 0) {
        total += reply.childReplies.length;
      }
    });

    return total;
  };

  // Add these helper functions to FeedbackList component
  const getRoleDisplay = (role) => {
    if (!role) return null;

    const roleMap = {
      admin: "Admin",
      lecturer: "Lecturer",
      student: "Student",
      guest: "Guest",
    };

    return roleMap[role.toLowerCase()] || role;
  };

  const getRoleBadgeColor = (role) => {
    if (!role)
      return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";

    const roleColorMap = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      lecturer:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      student:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      guest: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    };

    return (
      roleColorMap[role.toLowerCase()] ||
      "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  // Check if user can edit/delete feedback
  const canModifyFeedback = (feedback) => {
    if (!user) return false;
    const isAdmin = user.role === "admin";
    const isOwner = user.id === feedback.createdBy;
    return isAdmin || isOwner;
  };

  // Check if user can edit feedback (only the owner)
  const canEditFeedback = (feedback) => {
    if (!user) return false;
    return user.id === feedback.createdBy;
  };

  // Handle edit button click
  const handleEditClick = (feedback) => {
    console.log(`Edit button clicked for feedback ID: ${feedback.id}`);
    console.log("Setting up edit state with feedback:", feedback);

    setEditingFeedback(feedback);
    setEditContent(feedback.content);
    setEditRating(feedback.rating || 5);
    setSubmitError("");
    setActiveDropdown(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingFeedback(null);
    setEditContent("");
    setEditRating(5);
    setSubmitError("");
  };

  // Handle save edit
  const handleSaveEdit = async (feedbackId) => {
    if (editContent.trim().length < 10) {
      setSubmitError("Feedback content must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      console.log(`Attempting to update feedback with ID: ${feedbackId}`);

      const updatedFeedbackData = {
        content: editContent.trim(),
        rating: editRating,
        type: editingFeedback.type,
        targetId: editingFeedback.targetId,
      };

      // If it's a lesson feedback, include the lessonId
      if (editingFeedback.lessonId) {
        updatedFeedbackData.lessonId = editingFeedback.lessonId;
      }

      console.log("Sending update data:", updatedFeedbackData);
      const updatedFeedback = await FeedbackService.updateFeedback(
        feedbackId,
        updatedFeedbackData
      );
      console.log("Received updated feedback:", updatedFeedback);

      // Update the feedback in the list with all original properties preserved
      setFeedbacks((prevFeedbacks) => {
        const updatedFeedbacks = prevFeedbacks.map((feedback) => {
          if (feedback.id === feedbackId) {
            // Preserve all original properties and override with updated ones
            return {
              ...feedback,
              content: updatedFeedback.content || editContent.trim(),
              rating: updatedFeedback.rating || editRating,
              updatedAt: updatedFeedback.updatedAt || new Date().toISOString(),
            };
          }
          return feedback;
        });

        console.log("Updated feedbacks list");
        return updatedFeedbacks;
      });

      // Reset edit state
      setEditingFeedback(null);
      setEditContent("");
      setEditRating(5);

      console.log("Feedback updated in UI");

      // Refresh the feedbacks list to ensure UI is in sync with server
      // This is optional since we already updated the local state
      setTimeout(refreshFeedbacks, 300);
    } catch (err) {
      console.error("Error updating feedback:", err);
      setSubmitError(
        err.response?.data?.error ||
          "Error updating feedback. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a function to manually refresh the feedback list
  const refreshFeedbacks = async () => {
    console.log("Manually refreshing feedbacks list");
    try {
      setLoading(true);
      setError("");

      const headers = {};
      if (user && user.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }

      let url = `${API_URL}/feedbacks`;
      const params = new URLSearchParams();

      if (type) {
        params.append("type", type);
      }

      if (lessonId) {
        params.append("lessonId", lessonId);
      } else if (targetId) {
        params.append("targetId", targetId);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log("Refreshing feedbacks from:", url);
      const response = await axios.get(url, { headers });

      console.log("Refreshed feedbacks:", response.data);
      setFeedbacks(response.data);
    } catch (err) {
      console.error("Error refreshing feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete feedback
  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      console.log(`Attempting to delete feedback with ID: ${feedbackId}`);
      await FeedbackService.deleteFeedback(feedbackId);
      console.log(`Successfully deleted feedback with ID: ${feedbackId}`);

      // Remove the feedback from the list and force a UI update
      setFeedbacks((prevFeedbacks) => {
        console.log("Previous feedbacks:", prevFeedbacks.length);
        const updatedFeedbacks = prevFeedbacks.filter(
          (feedback) => feedback.id !== feedbackId
        );
        console.log("Updated feedbacks:", updatedFeedbacks.length);
        return updatedFeedbacks;
      });

      // Close dropdown menu if open
      if (activeDropdown === feedbackId) {
        setActiveDropdown(null);
      }

      // Reset expanded feedback if it was the deleted one
      if (expandedFeedback === feedbackId) {
        setExpandedFeedback(null);
      }

      console.log("Feedback removed from UI");

      // Refresh the feedbacks list to ensure UI is in sync with server
      // This is optional since we already updated the local state
      setTimeout(refreshFeedbacks, 300);
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert(
        err.response?.data?.error ||
          "Error deleting feedback. Please try again later."
      );
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (feedbackId) => {
    console.log(
      `Toggle dropdown for feedback ID: ${feedbackId}, current active: ${activeDropdown}`
    );
    setActiveDropdown(activeDropdown === feedbackId ? null : feedbackId);
  };

  // Hiển thị danh sách phản hồi
  const renderFeedbacks = () => {
    let displayFeedbacks = feedbacks;

    // Giới hạn số lượng hiển thị nếu có maxItems
    if (maxItems && displayFeedbacks.length > maxItems) {
      displayFeedbacks = displayFeedbacks.slice(0, maxItems);
    }

    if (displayFeedbacks.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{renderNoFeedbackMessage()}</p>
        </div>
      );
    }

    return displayFeedbacks.map((feedback) => (
      <div
        key={feedback.id}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <img
              src={feedback.userProfileImage || "/images/default-avatar.svg"}
              alt={feedback.userFullName || "User"}
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div>
              <div className="flex items-center flex-wrap gap-1">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {feedback.userFullName || "User"}
                </span>

                {feedback.userRole && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                      feedback.userRole
                    )}`}
                  >
                    {getRoleDisplay(feedback.userRole)}
                  </span>
                )}

                {!feedback.createdBy && (
                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                    Ẩn danh
                  </span>
                )}
              </div>
              <div className="flex items-center mt-1">
                {renderStarRating(feedback.rating)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDateTime(feedback.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleReplies(feedback.id)}
              className="flex items-center hover:underline focus:outline-none text-xs text-gray-500 dark:text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {feedback.replyCount > 0 ? (
                <span>{countTotalReplies(feedback.replies)} phản hồi</span>
              ) : (
                <span></span>
              )}
            </button>

            {canModifyFeedback(feedback) && (
              <div
                className="relative"
                ref={(el) => (dropdownRefs.current[feedback.id] = el)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(feedback.id);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
                  title="Tùy chọn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>

                {activeDropdown === feedback.id && (
                  <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1">
                    {canEditFeedback(feedback) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(feedback);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Sửa
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFeedback(feedback.id);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hiển thị thông tin chi tiết về đối tượng được phản hồi */}
        {type === "LESSON" && <FeedbackDetails feedback={feedback} />}
        {type === "LECTURER" && <LecturerFeedbackDetails feedback={feedback} />}

        {editingFeedback && editingFeedback.id === feedback.id ? (
          <div className="mt-3">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Đánh giá:
              </label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-6 h-6 ${
                        star <= editRating
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {editRating}/5
                </span>
              </div>
            </div>

            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="4"
                placeholder="Nhập nội dung phản hồi..."
              ></textarea>

              {submitError && (
                <p className="text-red-500 text-sm mt-1">{submitError}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdit(feedback.id)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-gray-700 dark:text-gray-300">
            {feedback.content}
          </div>
        )}

        {/* Hiển thị số lượng replies và nút để toggle hiển thị */}
        {expandedFeedback === feedback.id ? (
          <div>
            <FeedbackReplyList
              feedbackId={feedback.id}
              onReplyAdded={() => handleReplyAdded(feedback.id)}
            />
          </div>
        ) : (
          <div className="mt-3">
            <button
              onClick={() => toggleReplies(feedback.id)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              {feedback.replyCount > 0
                ? `View ${
                    countTotalReplies(feedback.replies) || feedback.replyCount
                  } replies`
                : "Reply"}
            </button>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="feedback-list">
      {showTitle && (
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          {getTitle()}
        </h2>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4">
          <p>{error}</p>
          {requireAuth && !user && (
            <button
              onClick={() =>
                navigate("/login", {
                  state: { from: window.location.pathname },
                })
              }
              className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Login now
            </button>
          )}
        </div>
      )}

      {!loading && !error && renderFeedbacks()}

      {/* Hiển thị nút "Xem tất cả" nếu có giới hạn và có nhiều phản hồi hơn giới hạn */}
      {maxItems && feedbacks.length > maxItems && (
        <div className="text-center mt-4">
          <button
            onClick={() =>
              navigate(
                `/feedbacks/${type.toLowerCase()}/${targetId || lessonId}`
              )
            }
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View all {feedbacks.length} feedbacks
          </button>
        </div>
      )}
    </div>
  );
}

export default FeedbackList;
