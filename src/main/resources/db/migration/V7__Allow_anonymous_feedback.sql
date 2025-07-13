-- Update feedbacks table to allow anonymous feedback (null created_by)
ALTER TABLE feedbacks DROP FOREIGN KEY fk_feedback_user;
ALTER TABLE feedbacks MODIFY created_by INT NULL;
ALTER TABLE feedbacks ADD CONSTRAINT fk_feedback_user 
    FOREIGN KEY (created_by) REFERENCES users (id); 