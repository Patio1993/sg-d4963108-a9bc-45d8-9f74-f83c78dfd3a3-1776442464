-- Add photo_url and emoji columns to foods table
ALTER TABLE foods ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE foods ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '🍽️';