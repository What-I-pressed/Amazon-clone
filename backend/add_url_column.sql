-- Add url column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS url VARCHAR(512);

-- Create uploads directories (you'll need to create these manually on the filesystem)
-- mkdir uploads
-- mkdir uploads/avatars
-- mkdir uploads/pictures (if not already exists)
