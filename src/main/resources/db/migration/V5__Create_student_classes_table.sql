-- Create a new junction table for the many-to-many relationship between students and classes
CREATE TABLE student_classes (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    class_id VARCHAR(20) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    UNIQUE KEY idx_user_class (user_id, class_id),
    KEY idx_class_id (class_id),
    CONSTRAINT fk_student_classes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_student_classes_class FOREIGN KEY (class_id) REFERENCES classes (class_id) ON DELETE CASCADE
);

-- Copy existing class assignments from users table to the new junction table
INSERT INTO student_classes (user_id, class_id, is_primary)
SELECT id, class_id, TRUE
FROM users
WHERE class_id IS NOT NULL; 