-- Drop old tables
DROP TABLE IF EXISTS food_entries CASCADE;

-- Foods table - master list of all available foods
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('g', 'ml')),
  -- Nutritional values per 100g/100ml
  kcal DECIMAL(10,2) NOT NULL DEFAULT 0,
  fiber DECIMAL(10,2) NOT NULL DEFAULT 0,
  sugar DECIMAL(10,2) NOT NULL DEFAULT 0,
  carbs DECIMAL(10,2) NOT NULL DEFAULT 0,
  fats DECIMAL(10,2) NOT NULL DEFAULT 0,
  protein DECIMAL(10,2) NOT NULL DEFAULT 0,
  salt DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consumed foods - actual consumption records
CREATE TABLE consumed_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'snack', 'lunch', 'afternoon_snack', 'dinner', 'coffee')),
  reaction TEXT CHECK (reaction IN ('good', 'neutral', 'bad')),
  day_number INTEGER NOT NULL,
  coffee_count INTEGER, -- only for meal_type = 'coffee'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activities log
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicines
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  diagnosis TEXT,
  dosage TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicine consumption log
CREATE TABLE medicine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WC entries
CREATE TABLE wc_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water intake
CREATE TABLE water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily summary
CREATE TABLE daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercise BOOLEAN NOT NULL DEFAULT false,
  walk_minutes INTEGER DEFAULT 0,
  restaurant BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_foods_user_id ON foods(user_id);
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_favorite ON foods(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_consumed_foods_user_date ON consumed_foods(user_id, date);
CREATE INDEX idx_consumed_foods_food_id ON consumed_foods(food_id);
CREATE INDEX idx_user_activities_user_date ON user_activities(user_id, date);
CREATE INDEX idx_medicine_logs_user_date ON medicine_logs(user_id, date);
CREATE INDEX idx_wc_entries_user_date ON wc_entries(user_id, date);
CREATE INDEX idx_water_intake_user_date ON water_intake(user_id, date);
CREATE INDEX idx_daily_summary_user_date ON daily_summary(user_id, date);

-- RLS Policies (T1 - private user data)
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_foods" ON foods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_foods" ON foods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_foods" ON foods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_foods" ON foods FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE consumed_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_consumed" ON consumed_foods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_consumed" ON consumed_foods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_consumed" ON consumed_foods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_consumed" ON consumed_foods FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_activities" ON activities FOR SELECT USING (true);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_user_activities" ON user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_user_activities" ON user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_user_activities" ON user_activities FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_medicines" ON medicines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_medicines" ON medicines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_medicines" ON medicines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_medicines" ON medicines FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE medicine_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_medicine_logs" ON medicine_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_medicine_logs" ON medicine_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_medicine_logs" ON medicine_logs FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE wc_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_wc" ON wc_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_wc" ON wc_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_wc" ON wc_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_wc" ON wc_entries FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_water" ON water_intake FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_water" ON water_intake FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_water" ON water_intake FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE daily_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_summary" ON daily_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_summary" ON daily_summary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_summary" ON daily_summary FOR UPDATE USING (auth.uid() = user_id);

-- Seed activities
INSERT INTO activities (name, is_system) VALUES
  ('Prechádzka', true),
  ('Nákup', true),
  ('Pranie', true),
  ('Upratovanie', true),
  ('Varenie', true),
  ('Práca', true),
  ('Cvičenie', true),
  ('Záhrada', true);