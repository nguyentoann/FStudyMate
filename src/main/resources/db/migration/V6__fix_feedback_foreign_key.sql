-- Fix feedback table foreign key constraint if needed
-- First check if the constraint exists and drop it if it does
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'feedbacks'
    AND CONSTRAINT_NAME = 'fk_feedback_user'
);

SET @sql = IF(@constraint_exists > 0,
    'ALTER TABLE feedbacks DROP FOREIGN KEY fk_feedback_user',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Now create the correct constraint
ALTER TABLE feedbacks
ADD CONSTRAINT fk_feedback_user
FOREIGN KEY (created_by) REFERENCES users(id)
ON DELETE SET NULL; 