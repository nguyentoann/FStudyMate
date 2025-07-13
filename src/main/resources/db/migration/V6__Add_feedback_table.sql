-- Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(2000) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    type VARCHAR(20) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Create indexes for better query performance
CREATE INDEX idx_feedback_type ON feedbacks (type);
CREATE INDEX idx_feedback_target ON feedbacks (target_id);
CREATE INDEX idx_feedback_created_by ON feedbacks (created_by); 