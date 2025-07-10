-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_system_generated BOOLEAN DEFAULT FALSE,
    attachment_path VARCHAR(255),
    attachment_type VARCHAR(50),
    is_unsent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create notification_recipients table
CREATE TABLE IF NOT EXISTS notification_recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NOT NULL,
    recipient_id INT NOT NULL,
    recipient_type VARCHAR(50) NOT NULL, -- INDIVIDUAL, CLASS, ALL_STUDENTS, ALL_OUTSRC_STUDENTS, ALL_LECTURERS, ALL
    class_id VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create index for better performance
CREATE INDEX idx_notification_recipients_notification_id ON notification_recipients(notification_id);
CREATE INDEX idx_notification_recipients_recipient_id ON notification_recipients(recipient_id);
CREATE INDEX idx_notification_recipients_is_read ON notification_recipients(is_read);
CREATE INDEX idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX idx_notifications_is_unsent ON notifications(is_unsent); 