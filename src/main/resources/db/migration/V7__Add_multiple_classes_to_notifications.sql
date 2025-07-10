-- Add target_role column to notifications table if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS target_role VARCHAR(50) DEFAULT NULL;

-- Create a new table for notification_classes to support multiple classes per notification
CREATE TABLE IF NOT EXISTS notification_classes (
    notification_id INT NOT NULL,
    class_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (notification_id, class_id),
    CONSTRAINT fk_notification_classes_notification
        FOREIGN KEY (notification_id)
        REFERENCES notifications (id)
        ON DELETE CASCADE
);

-- Add index for better performance
CREATE INDEX idx_notification_classes_class_id ON notification_classes (class_id);

-- Add a new column to track if a notification is for outsource students
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS is_for_outsource_students BOOLEAN DEFAULT FALSE; 