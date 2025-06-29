package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.PasswordResetToken;
import com.mycompany.fstudymate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository để thao tác với token đặt lại mật khẩu
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    /**
     * Tìm token theo giá trị token
     * @param token Giá trị token
     * @return Optional của PasswordResetToken
     */
    Optional<PasswordResetToken> findByToken(String token);
    
    /**
     * Tìm token chưa sử dụng và chưa hết hạn của user
     * @param user User
     * @return Optional của PasswordResetToken
     */
    Optional<PasswordResetToken> findByUserAndUsedFalse(User user);
} 