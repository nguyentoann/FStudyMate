package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Scheduler để dọn dẹp token đặt lại mật khẩu hết hạn
 */
@Component
public class TokenCleanupScheduler {
    
    private static final Logger LOGGER = Logger.getLogger(TokenCleanupScheduler.class.getName());
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    /**
     * Chạy hàng ngày lúc 2:00 sáng để dọn dẹp token hết hạn
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredTokens() {
        LOGGER.info("Đang dọn dẹp token đặt lại mật khẩu hết hạn...");
        
        try {
            if (passwordResetService == null) {
                passwordResetService = new PasswordResetService();
            }
            
            int deletedCount = passwordResetService.cleanupExpiredTokens();
            LOGGER.info("Đã xóa " + deletedCount + " token hết hạn");
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Lỗi khi dọn dẹp token hết hạn", e);
        }
    }
} 