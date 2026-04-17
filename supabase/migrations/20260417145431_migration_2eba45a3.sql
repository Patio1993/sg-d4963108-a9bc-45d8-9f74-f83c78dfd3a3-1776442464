-- Add new columns to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS nickname text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS weight numeric(5,2),
  ADD COLUMN IF NOT EXISTS gender text;

-- Add check constraint for gender
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_gender_check 
  CHECK (gender IS NULL OR gender IN ('male', 'female', 'other'));

-- Add check constraint for age
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_age_check 
  CHECK (age IS NULL OR (age > 0 AND age < 150));

-- Add check constraint for weight
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_weight_check 
  CHECK (weight IS NULL OR (weight > 0 AND weight < 500));