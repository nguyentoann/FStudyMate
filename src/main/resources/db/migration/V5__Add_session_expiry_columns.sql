-- Add expiry_time and is_expired columns to user_sessions table
ALTER TABLE user_sessions ADD COLUMN expiry_time TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 24 HOUR);
ALTER TABLE user_sessions ADD COLUMN is_expired BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing sessions to have an expiry time of 24 hours after creation
UPDATE user_sessions SET expiry_time = DATE_ADD(created_at, INTERVAL 24 HOUR);

-- Mark sessions as expired if their expiry time has passed
UPDATE user_sessions SET is_expired = TRUE WHERE expiry_time < CURRENT_TIMESTAMP; 