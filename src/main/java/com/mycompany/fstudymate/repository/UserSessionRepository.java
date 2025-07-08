package com.mycompany.fstudymate.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mycompany.fstudymate.model.UserSession;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Integer> {
    
    // Find by session token (returning list to handle duplicate tokens)
    List<UserSession> findBySessionToken(String sessionToken);
    
    // Find most recent session by token - Fixed by removing LIMIT which is invalid in JPQL
    @Query("SELECT us FROM UserSession us WHERE us.sessionToken = :token ORDER BY us.lastActivity DESC")
    List<UserSession> findBySessionTokenOrderByLastActivityDesc(@Param("token") String token);
    
    // Find active sessions with recent activity
    @Query("SELECT us FROM UserSession us WHERE us.lastActivity > :cutoffTime AND us.isExpired = false")
    List<UserSession> findActiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Count active users
    @Query("SELECT COUNT(us) FROM UserSession us WHERE us.lastActivity > :cutoffTime AND us.isExpired = false")
    Long countActiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find sessions by user ID
    List<UserSession> findByUserId(Integer userId);
    
    // Get login counts grouped by day
    @Query(value = "SELECT DATE(created_at) as login_date, COUNT(*) as count " +
           "FROM user_sessions " +
           "WHERE created_at >= :startDate " +
           "GROUP BY DATE(created_at) " +
           "ORDER BY login_date", nativeQuery = true)
    List<Object[]> getLoginCountByDay(@Param("startDate") LocalDateTime startDate);
    
    // Find expired sessions, ordered by expiry time (most recent first)
    @Query("SELECT us FROM UserSession us WHERE us.expiryTime < :currentTime OR us.isExpired = true ORDER BY us.expiryTime DESC")
    List<UserSession> findExpiredSessions(@Param("currentTime") LocalDateTime currentTime);
    
    // Count expired sessions
    @Query("SELECT COUNT(us) FROM UserSession us WHERE us.expiryTime < :currentTime OR us.isExpired = true")
    Long countExpiredSessions(@Param("currentTime") LocalDateTime currentTime);
    
    // Find sessions that will expire soon
    @Query("SELECT us FROM UserSession us WHERE us.expiryTime BETWEEN :currentTime AND :futureTime AND us.isExpired = false")
    List<UserSession> findSessionsExpiringBetween(@Param("currentTime") LocalDateTime currentTime, @Param("futureTime") LocalDateTime futureTime);
} 