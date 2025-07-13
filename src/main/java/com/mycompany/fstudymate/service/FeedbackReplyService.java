package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.dto.FeedbackReplyRequest;
import com.mycompany.fstudymate.dto.FeedbackReplyResponse;

import java.util.List;

public interface FeedbackReplyService {
    
    /**
     * Create a new reply for a feedback
     * 
     * @param replyRequest The reply request containing feedback ID, content, etc.
     * @param userId The ID of the user creating the reply (can be null for anonymous)
     * @return The created reply response
     */
    FeedbackReplyResponse createReply(FeedbackReplyRequest replyRequest, Integer userId);
    
    /**
     * Get all replies for a feedback, organized in a hierarchical structure
     * 
     * @param feedbackId The ID of the feedback
     * @return List of top-level replies with their nested replies
     */
    List<FeedbackReplyResponse> getRepliesByFeedbackId(Long feedbackId);
    
    /**
     * Get all replies created by a specific user
     * 
     * @param userId The ID of the user
     * @return List of replies created by the user
     */
    List<FeedbackReplyResponse> getRepliesByUser(Integer userId);
    
    /**
     * Delete a reply
     * 
     * @param replyId The ID of the reply to delete
     * @param userId The ID of the user attempting to delete the reply
     * @return true if successful, false otherwise
     */
    boolean deleteReply(Long replyId, Integer userId);
    
    /**
     * Create a nested reply (reply to another reply)
     * 
     * @param parentReplyId The ID of the parent reply
     * @param replyRequest The reply request
     * @param userId The ID of the user creating the reply
     * @return The created reply response
     */
    FeedbackReplyResponse createNestedReply(Long parentReplyId, FeedbackReplyRequest replyRequest, Integer userId);
    
    /**
     * Get all nested replies for a parent reply
     * 
     * @param parentReplyId The ID of the parent reply
     * @return List of nested replies
     */
    List<FeedbackReplyResponse> getNestedReplies(Long parentReplyId);

    /**
     * Update an existing reply
     * 
     * @param replyId The ID of the reply to update
     * @param replyRequest The updated reply data
     * @param userId The ID of the user attempting to update the reply
     * @return The updated reply response
     */
    FeedbackReplyResponse updateReply(Long replyId, FeedbackReplyRequest replyRequest, Integer userId);
} 