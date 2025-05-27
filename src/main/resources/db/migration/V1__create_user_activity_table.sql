-- Just add columns to the user_sessions table if they don't exist
-- Let Hibernate handle the user_activity_details table creation in update mode
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS current_page VARCHAR(255),
ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);

-- Create a companion table for device information
CREATE TABLE IF NOT EXISTS user_activity_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    device_info JSON,
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    is_mobile BOOLEAN,
    device_fingerprint VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id)
); 