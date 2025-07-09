-- Add target_role column to notifications table
ALTER TABLE notifications 
ADD COLUMN target_role VARCHAR(50) DEFAULT NULL AFTER class_id;

-- Update notification_type enum to include ROLE type
ALTER TABLE notifications 
MODIFY COLUMN notification_type ENUM('ALL', 'CLASS', 'GROUP', 'ROLE') NOT NULL; 