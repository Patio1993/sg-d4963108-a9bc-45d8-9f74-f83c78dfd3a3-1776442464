-- Add daily_limit column to foods table
ALTER TABLE foods ADD COLUMN daily_limit numeric(10,2) NULL;

COMMENT ON COLUMN foods.daily_limit IS 'Recommended daily limit in g or ml (depends on unit)';