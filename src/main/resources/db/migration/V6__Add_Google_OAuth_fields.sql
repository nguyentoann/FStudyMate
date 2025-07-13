-- Add Google OAuth fields to users table
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500) DEFAULT NULL;

-- Add index for Google ID lookup
CREATE INDEX idx_users_google_id ON users(google_id); 