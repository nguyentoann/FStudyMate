package com.mycompany.fstudymate.service.impl;

import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.service.EmailService;
import com.mycompany.fstudymate.service.PasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation đơn giản của PasswordResetService sử dụng memory store
 * thay vì database để dễ triển khai (tương tự như OTP system)
 */
@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetServiceImpl.class);
    private static final int EXPIRATION_MINUTES = 15; // Giảm thời gian cho OTP
    private static final int OTP_LENGTH = 6;
    
    // Lưu trữ OTP: otp -> {email, expiry, used}
    private final Map<String, Map<String, Object>> otpStore = new ConcurrentHashMap<>();
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired(required = false) // Không bắt buộc để có thể chạy trong môi trường test
    private PasswordEncoder passwordEncoder;

    /**
     * Tạo OTP ngẫu nhiên
     */
    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10)); // Số từ 0-9
        }
        
        return otp.toString();
    }

    @Override
    public boolean processForgotPasswordRequest(String email) {
        // Kiểm tra email có tồn tại không trong database
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (!userOptional.isPresent()) {
            logger.info("Yêu cầu đặt lại mật khẩu cho email không tồn tại: {}", email);
            return false;
        }
        
        // Vô hiệu hóa các OTP cũ nếu có
        invalidateOldOtps(email);
        
        // Tạo OTP mới
        String otp = generateOtp();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);
        
        // Lưu OTP vào memory store
        Map<String, Object> otpData = new HashMap<>();
        otpData.put("email", email);
        otpData.put("expiry", expiryDate);
        otpData.put("used", false);
        
        otpStore.put(otp, otpData);
        
        // Gửi email với OTP đặt lại mật khẩu
        boolean emailSent = false;
        try {
            emailSent = emailService.sendPasswordResetOtp(email, otp);
            logger.info("Đã xử lý yêu cầu đặt lại mật khẩu cho: {}, email được gửi: {}", email, emailSent);
        } catch (Exception e) {
            logger.error("Lỗi gửi email OTP: {}", e.getMessage(), e);
            // Đảm bảo rằng OTP vẫn hợp lệ ngay cả khi email không gửi được
            // để người dùng có thể dùng nếu họ nhìn thấy nó trong log (chỉ trong dev/test)
            if (logger.isDebugEnabled()) {
                logger.debug("OTP được tạo nhưng email không gửi được: {} - OTP: {}", email, otp);
            }
        }
        
        return true;
    }

    @Override
    public boolean validateResetToken(String otp) {
        Map<String, Object> otpData = otpStore.get(otp);
        
        if (otpData == null) {
            logger.warn("OTP không tồn tại: {}", otp);
            return false;
        }
        
        // Kiểm tra OTP đã được sử dụng chưa
        if ((boolean) otpData.get("used")) {
            logger.warn("OTP đã được sử dụng: {}", otp);
            return false;
        }
        
        // Kiểm tra OTP còn hạn không
        LocalDateTime expiryDate = (LocalDateTime) otpData.get("expiry");
        if (LocalDateTime.now().isAfter(expiryDate)) {
            logger.warn("OTP đã hết hạn: {}", otp);
            return false;
        }
        
        return true;
    }

    @Override
    public boolean resetPassword(String otp, String newPassword) {
        if (!validateResetToken(otp)) {
            return false;
        }
        
        Map<String, Object> otpData = otpStore.get(otp);
        String email = (String) otpData.get("email");
        
        // Tìm user từ database
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (!userOptional.isPresent()) {
            logger.warn("Không thể đặt lại mật khẩu: User với email {} không tồn tại", email);
            return false;
        }
        
        User user = userOptional.get();
        
        try {
            String hashedPassword = (passwordEncoder != null) ? 
                passwordEncoder.encode(newPassword) : newPassword;
                
            // Sử dụng JPQL
            try {
                // Cập nhật trực tiếp cột password_hash và đánh dấu verified = true
                String updateQuery = "UPDATE users SET password_hash = :hashedPassword, verified = true WHERE email = :email";
                
                int rowsUpdated = entityManager.createNativeQuery(updateQuery)
                    .setParameter("hashedPassword", hashedPassword)
                    .setParameter("email", email)
                    .executeUpdate();
                
                if (rowsUpdated > 0) {
                    logger.info("Đã cập nhật mật khẩu qua JPQL cho user: {}", email);
                    
                    // Đánh dấu OTP đã sử dụng
                    otpData.put("used", true);
                    return true;
                } else {
                    // Nếu không thành công với JPQL, thử sử dụng JDBC trực tiếp
                    logger.warn("Cập nhật JPQL không thành công, thử với JDBC...");
                    return updatePasswordWithJDBC(email, hashedPassword);
                }
            } catch (Exception e) {
                logger.warn("Lỗi khi cập nhật với JPQL: {}. Thử với JDBC...", e.getMessage());
                return updatePasswordWithJDBC(email, hashedPassword);
            }
        } catch (Exception e) {
            logger.error("Lỗi khi cập nhật mật khẩu: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Cập nhật mật khẩu sử dụng JDBC trực tiếp
     */
    private boolean updatePasswordWithJDBC(String email, String hashedPassword) {
        Connection connection = null;
        PreparedStatement pstmt = null;
        
        try {
            connection = dataSource.getConnection();
            
            // Cập nhật cả password_hash và verified
            String sql = "UPDATE users SET password_hash = ?, verified = ? WHERE email = ?";
            pstmt = connection.prepareStatement(sql);
            pstmt.setString(1, hashedPassword);
            pstmt.setBoolean(2, true);
            pstmt.setString(3, email);
            
            int rowsUpdated = pstmt.executeUpdate();
            
            if (rowsUpdated > 0) {
                logger.info("Đã cập nhật mật khẩu qua JDBC cho user: {}", email);
                return true;
            } else {
                logger.warn("Không tìm thấy user để cập nhật mật khẩu: {}", email);
                return false;
            }
        } catch (SQLException e) {
            logger.error("Lỗi SQL khi cập nhật mật khẩu: {}", e.getMessage(), e);
            return false;
        } finally {
            if (pstmt != null) {
                try {
                    pstmt.close();
                } catch (SQLException e) {
                    logger.error("Lỗi khi đóng PreparedStatement: {}", e.getMessage());
                }
            }
            if (connection != null) {
                try {
                    connection.close();
                } catch (SQLException e) {
                    logger.error("Lỗi khi đóng Connection: {}", e.getMessage());
                }
            }
        }
    }

    @Override
    public String getEmailFromOtp(String otp) {
        Map<String, Object> otpData = otpStore.get(otp);
        return otpData != null ? (String) otpData.get("email") : null;
    }
    
    @Override
    public void clearTokens() {
        otpStore.clear();
        logger.info("Đã xóa tất cả OTP");
    }
    
    /**
     * Vô hiệu hóa các OTP cũ của email
     */
    private void invalidateOldOtps(String email) {
        otpStore.forEach((key, value) -> {
            if (email.equals(value.get("email"))) {
                value.put("used", true);
            }
        });
    }
} 