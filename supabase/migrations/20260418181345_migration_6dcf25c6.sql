-- Add target (optimal) columns for nutritional values
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fiber_target NUMERIC,
ADD COLUMN IF NOT EXISTS sugar_target NUMERIC,
ADD COLUMN IF NOT EXISTS carbs_target NUMERIC,
ADD COLUMN IF NOT EXISTS fats_target NUMERIC,
ADD COLUMN IF NOT EXISTS protein_target NUMERIC,
ADD COLUMN IF NOT EXISTS kcal_target NUMERIC;

COMMENT ON COLUMN profiles.fiber_target IS 'Target/optimal fiber intake in grams';
COMMENT ON COLUMN profiles.sugar_target IS 'Target/optimal sugar intake in grams';
COMMENT ON COLUMN profiles.carbs_target IS 'Target/optimal carbohydrates intake in grams';
COMMENT ON COLUMN profiles.fats_target IS 'Target/optimal fats intake in grams';
COMMENT ON COLUMN profiles.protein_target IS 'Target/optimal protein intake in grams';
COMMENT ON COLUMN profiles.kcal_target IS 'Target/optimal calorie intake';