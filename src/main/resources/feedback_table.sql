-- Create feedback table for storing user ratings and comments
CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookup by user_id
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback (user_id);

-- Create index for faster visibility filtering
CREATE INDEX IF NOT EXISTS idx_feedback_visibility ON feedback (is_visible); 