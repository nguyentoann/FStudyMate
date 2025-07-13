-- Add lesson_id column to feedbacks table
ALTER TABLE feedbacks 
ADD COLUMN lesson_id INT NULL,
ADD CONSTRAINT fk_feedback_lesson FOREIGN KEY (lesson_id) REFERENCES Lessons(ID) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX idx_feedback_lesson ON feedbacks(lesson_id);

-- Update existing LESSON type feedbacks if possible (this might need manual review)
-- This is just a placeholder - you might need to implement custom logic to map existing feedbacks
-- UPDATE feedbacks SET lesson_id = CAST(target_id AS SIGNED) WHERE type = 'LESSON' AND target_id REGEXP '^[0-9]+$'; 