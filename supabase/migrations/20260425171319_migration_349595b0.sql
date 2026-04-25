-- Remove the columns added today
ALTER TABLE foods DROP COLUMN IF EXISTS daily_limit;
ALTER TABLE foods DROP COLUMN IF EXISTS notes;