ALTER TABLE foods ADD COLUMN notes TEXT NULL;
COMMENT ON COLUMN foods.notes IS 'Optional notes for the food';