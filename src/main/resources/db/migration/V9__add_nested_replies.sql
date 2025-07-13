-- Add parent_reply_id column to feedback_replies table
ALTER TABLE `feedback_replies` 
ADD COLUMN `parent_reply_id` bigint(20) DEFAULT NULL AFTER `feedback_id`,
ADD CONSTRAINT `fk_parent_reply` FOREIGN KEY (`parent_reply_id`) REFERENCES `feedback_replies` (`id`) ON DELETE CASCADE,
ADD INDEX `idx_parent_reply` (`parent_reply_id`);

-- Remove is_official column as it's no longer needed
ALTER TABLE `feedback_replies` DROP COLUMN `is_official`; 