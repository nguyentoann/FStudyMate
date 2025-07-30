import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import FeedbackForm from "../../components/FeedbackForm";
import LessonFeedbackForm from "../../components/LessonFeedbackForm";
import LecturerFeedbackForm from "../../components/LecturerFeedbackForm";
import FeedbackList from "../../components/FeedbackList";
import { useAuth } from "../../context/AuthContext";

function FeedbackPage() {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Lấy type và targetId từ query params hoặc sử dụng giá trị mặc định
  const [feedbackType, setFeedbackType] = useState(
    queryParams.get("type") || "SYSTEM"
  );
  const [targetId, setTargetId] = useState(
    queryParams.get("targetId") || "system"
  );
  const [targetName, setTargetName] = useState(
    queryParams.get("targetName") || "Hệ thống"
  );

  // State để quản lý việc refresh danh sách feedback sau khi gửi
  const [refreshKey, setRefreshKey] = useState(0);

  // State để theo dõi lesson được chọn từ LessonFeedbackForm
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  // State để theo dõi lecturer được chọn từ LecturerFeedbackForm
  const [selectedLecturerId, setSelectedLecturerId] = useState(null);

  // Xử lý khi feedback được gửi thành công
  const handleFeedbackSubmitSuccess = (feedback) => {
    console.log("Feedback submitted successfully:", feedback);

    // Tăng refreshKey để force re-render FeedbackList component
    setRefreshKey((prevKey) => {
      const newKey = prevKey + 1;
      console.log(
        `Updating refreshKey from ${prevKey} to ${newKey} to trigger FeedbackList refresh`
      );
      return newKey;
    });

    // Nếu là feedback về bài học, lưu lessonId để hiển thị danh sách feedback phù hợp
    if (feedback && feedback.type === "LESSON" && feedback.lessonId) {
      console.log(`Setting selectedLessonId to ${feedback.lessonId}`);
      setSelectedLessonId(feedback.lessonId);
    }

    // Nếu là feedback về giảng viên, lưu lecturerId để hiển thị danh sách feedback phù hợp
    if (feedback && feedback.type === "LECTURER" && feedback.targetId) {
      console.log(`Setting selectedLecturerId to ${feedback.targetId}`);
      setSelectedLecturerId(feedback.targetId);
      setTargetId(feedback.targetId);
    }

    // Small delay to ensure state updates have propagated
    setTimeout(() => {
      console.log("FeedbackList should now be refreshed with the new feedback");
    }, 100);
  };

  // Xử lý khi thay đổi loại feedback
  const handleTypeChange = (e) => {
    setFeedbackType(e.target.value);

    // Reset selectedLessonId và selectedLecturerId khi chuyển sang loại feedback khác
    if (e.target.value !== "LESSON") {
      setSelectedLessonId(null);
    }

    if (e.target.value !== "LECTURER") {
      setSelectedLecturerId(null);
    }

    // Đặt targetId và targetName mặc định cho loại mới
    switch (e.target.value) {
      case "SYSTEM":
        setTargetId("system");
        setTargetName("Hệ thống");
        break;
      case "USER":
        setTargetId(user?.id?.toString() || "0");
        setTargetName(user?.fullName || "Người dùng");
        break;
      default:
        // Giữ nguyên giá trị cũ cho các loại khác
        break;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          Feedback and reviews
        </h1>

        {/* Chọn loại feedback */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Choose a response type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="feedbackType"
                value="SYSTEM"
                checked={feedbackType === "SYSTEM"}
                onChange={handleTypeChange}
              />
              <span className="text-gray-700 dark:text-gray-300">System</span>
            </label>

            <label className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="feedbackType"
                value="LESSON"
                checked={feedbackType === "LESSON"}
                onChange={handleTypeChange}
              />
              <span className="text-gray-700 dark:text-gray-300">Lesson</span>
            </label>

            <label className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="feedbackType"
                value="LECTURER"
                checked={feedbackType === "LECTURER"}
                onChange={handleTypeChange}
              />
              <span className="text-gray-700 dark:text-gray-300">Lecturer</span>
            </label>

            <label className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="feedbackType"
                value="USER"
                checked={feedbackType === "USER"}
                onChange={handleTypeChange}
              />
              <span className="text-gray-700 dark:text-gray-300">User</span>
            </label>
          </div>

          {/* Input cho targetId và targetName nếu không phải SYSTEM và không phải LESSON và không phải LECTURER */}
          {feedbackType !== "SYSTEM" &&
            feedbackType !== "LESSON" &&
            feedbackType !== "LECTURER" && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID {feedbackType === "USER" ? "Người dùng" : ""}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên {feedbackType === "USER" ? "Người dùng" : ""}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                  />
                </div>
              </div>
            )}
        </div>

        {/* Form gửi feedback */}
        <div className="mb-6">
          {feedbackType === "LESSON" ? (
            <LessonFeedbackForm onSuccess={handleFeedbackSubmitSuccess} />
          ) : feedbackType === "LECTURER" ? (
            <LecturerFeedbackForm onSuccess={handleFeedbackSubmitSuccess} />
          ) : (
            <FeedbackForm
              type={feedbackType}
              targetId={targetId}
              targetName={targetName}
              onSuccess={handleFeedbackSubmitSuccess}
            />
          )}
        </div>

        {/* Danh sách feedback */}
        <div>
          {feedbackType === "LESSON" && selectedLessonId ? (
            // Hiển thị phản hồi cho bài học cụ thể nếu có selectedLessonId
            <FeedbackList
              key={`${refreshKey}-lesson-${selectedLessonId}`}
              type={feedbackType}
              showTitle={true}
              maxItems={10}
              lessonId={selectedLessonId}
            />
          ) : feedbackType === "LESSON" ? (
            // Hiển thị tất cả phản hồi về bài học nếu không có selectedLessonId
            <FeedbackList
              key={`${refreshKey}-all-lessons`}
              type={feedbackType}
              showTitle={true}
              maxItems={10}
            />
          ) : feedbackType === "LECTURER" && selectedLecturerId ? (
            // Hiển thị phản hồi cho giảng viên cụ thể nếu có selectedLecturerId
            <FeedbackList
              key={`${refreshKey}-lecturer-${selectedLecturerId}`}
              type={feedbackType}
              showTitle={true}
              maxItems={10}
              targetId={selectedLecturerId}
            />
          ) : feedbackType === "LECTURER" ? (
            // Hiển thị tất cả phản hồi về giảng viên nếu không có selectedLecturerId
            <FeedbackList
              key={`${refreshKey}-all-lecturers`}
              type={feedbackType}
              showTitle={true}
              maxItems={10}
            />
          ) : (
            // Hiển thị phản hồi cho các loại khác
            <FeedbackList
              key={refreshKey}
              type={feedbackType}
              targetId={targetId}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default FeedbackPage;
