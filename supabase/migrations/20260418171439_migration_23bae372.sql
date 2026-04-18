-- Add nutritional limits and goals to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fiber_min numeric(5,1) DEFAULT 25,
ADD COLUMN IF NOT EXISTS fiber_max numeric(5,1) DEFAULT 30,
ADD COLUMN IF NOT EXISTS sugar_min numeric(5,1) DEFAULT 30,
ADD COLUMN IF NOT EXISTS sugar_max numeric(5,1) DEFAULT 50,
ADD COLUMN IF NOT EXISTS carbs_min numeric(5,1) DEFAULT 200,
ADD COLUMN IF NOT EXISTS carbs_max numeric(5,1) DEFAULT 300,
ADD COLUMN IF NOT EXISTS fats_min numeric(5,1) DEFAULT 50,
ADD COLUMN IF NOT EXISTS fats_max numeric(5,1) DEFAULT 60,
ADD COLUMN IF NOT EXISTS protein_min numeric(5,1) DEFAULT 50,
ADD COLUMN IF NOT EXISTS protein_max numeric(5,1) DEFAULT 100,
ADD COLUMN IF NOT EXISTS salt_max numeric(5,1) DEFAULT 6,
ADD COLUMN IF NOT EXISTS kcal_min numeric(6,1) DEFAULT 1500,
ADD COLUMN IF NOT EXISTS kcal_max numeric(6,1) DEFAULT 2500,
ADD COLUMN IF NOT EXISTS water_goal_ml integer DEFAULT 2000,
ADD COLUMN IF NOT EXISTS health_goal text DEFAULT 'maintain';

-- Add check constraint for health goal
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_health_goal_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_health_goal_check 
CHECK (health_goal IN ('lose_weight', 'maintain', 'gain_muscle', 'improve_digestion'));

COMMENT ON COLUMN profiles.health_goal IS 'User health goal: lose_weight, maintain, gain_muscle, improve_digestion';