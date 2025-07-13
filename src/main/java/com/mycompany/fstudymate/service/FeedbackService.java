package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.dto.FeedbackRequest;
import com.mycompany.fstudymate.dto.FeedbackResponse;
import com.mycompany.fstudymate.model.Feedback.FeedbackType;

import java.util.List;

public interface FeedbackService {

    /**
     * Tạo feedback mới từ yêu cầu của người dùng
     * 
     * @param feedbackRequest DTO chứa thông tin feedback
     * @param userId ID của người dùng đang tạo feedback
     * @return FeedbackResponse chứa thông tin feedback đã được tạo
     */
    FeedbackResponse createFeedback(FeedbackRequest feedbackRequest, Integer userId);
    
    /**
     * Lấy danh sách feedback theo loại và ID đối tượng
     * 
     * @param type Loại feedback (LESSON, LECTURER, SYSTEM, USER)
     * @param targetId ID của đối tượng được feedback
     * @return Danh sách các feedback response
     */
    List<FeedbackResponse> getFeedbacksByTypeAndTargetId(FeedbackType type, String targetId);
    
    /**
     * Lấy danh sách feedback do người dùng tạo ra
     * 
     * @param userId ID của người dùng
     * @return Danh sách các feedback response
     */
    List<FeedbackResponse> getFeedbacksByUser(Integer userId);
    
    /**
     * Lấy danh sách tất cả feedback theo loại
     * 
     * @param type Loại feedback
     * @return Danh sách các feedback response
     */
    List<FeedbackResponse> getFeedbacksByType(FeedbackType type);
    
    /**
     * Lấy danh sách feedback theo bài học
     * 
     * @param lessonId ID của bài học
     * @return Danh sách các feedback response
     */
    List<FeedbackResponse> getFeedbacksByLessonId(Integer lessonId);
    
    /**
     * Lấy feedback theo ID
     * 
     * @param id ID của feedback
     * @return FeedbackResponse chứa thông tin feedback
     */
    FeedbackResponse getFeedbackById(Long id);
    
    /**
     * Cập nhật feedback
     * 
     * @param id ID của feedback cần cập nhật
     * @param feedbackRequest DTO chứa thông tin feedback mới
     * @param userId ID của người dùng đang cập nhật feedback
     * @return FeedbackResponse chứa thông tin feedback đã được cập nhật
     * @throws IllegalArgumentException nếu người dùng không có quyền cập nhật
     */
    FeedbackResponse updateFeedback(Long id, FeedbackRequest feedbackRequest, Integer userId);
    
    /**
     * Xóa feedback
     * 
     * @param id ID của feedback cần xóa
     * @param userId ID của người dùng đang xóa feedback
     * @return true nếu xóa thành công, false nếu không
     * @throws IllegalArgumentException nếu người dùng không có quyền xóa
     */
    boolean deleteFeedback(Long id, Integer userId);
} 