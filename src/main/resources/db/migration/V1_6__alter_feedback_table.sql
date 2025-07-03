-- Modify feedback table to make the comment field nullable or give it a default value
ALTER TABLE feedback MODIFY COLUMN comment TEXT NULL;

-- Update any existing records with NULL comment value to empty string
UPDATE feedback SET comment = '' WHERE comment IS NULL; 