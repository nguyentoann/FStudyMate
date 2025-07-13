package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.FeedbackReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackReplyRepository extends JpaRepository<FeedbackReply, Long> {
    
    // Find top-level replies (where parent_reply_id is null)
    @Query("SELECT fr FROM FeedbackReply fr WHERE fr.feedbackId = :feedbackId AND fr.parentReplyId IS NULL ORDER BY fr.createdAt ASC")
    List<FeedbackReply> findTopLevelRepliesByFeedbackId(@Param("feedbackId") Long feedbackId);
    
    // Find all replies for a feedback with eager loading of user and child replies
    @Query("SELECT DISTINCT fr FROM FeedbackReply fr " +
           "LEFT JOIN FETCH fr.user " +
           "LEFT JOIN FETCH fr.childReplies childReplies " +
           "LEFT JOIN FETCH childReplies.user " +
           "WHERE fr.feedbackId = :feedbackId AND fr.parentReplyId IS NULL " +
           "ORDER BY fr.createdAt ASC")
    List<FeedbackReply> findByFeedbackIdWithUserAndChildReplies(@Param("feedbackId") Long feedbackId);
    
    // Find replies by parent reply ID
    List<FeedbackReply> findByParentReplyIdOrderByCreatedAtAsc(Long parentReplyId);
    
    // Legacy method - kept for backward compatibility
    @Query("SELECT fr FROM FeedbackReply fr LEFT JOIN FETCH fr.user WHERE fr.feedbackId = :feedbackId ORDER BY fr.createdAt ASC")
    List<FeedbackReply> findByFeedbackIdWithUser(@Param("feedbackId") Long feedbackId);
    
    List<FeedbackReply> findByCreatedByOrderByCreatedAtDesc(Integer createdBy);
    
    @Query("SELECT COUNT(fr) FROM FeedbackReply fr WHERE fr.feedbackId = :feedbackId")
    long countByFeedbackId(@Param("feedbackId") Long feedbackId);
    
    @Query("SELECT COUNT(fr) FROM FeedbackReply fr WHERE fr.parentReplyId = :parentReplyId")
    long countByParentReplyId(@Param("parentReplyId") Long parentReplyId);
} 