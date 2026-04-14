-- Create food_entries table
CREATE TABLE food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks')),
  food_name TEXT NOT NULL,
  portion TEXT NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  eaten_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

-- T1 RLS policies (private user data)
CREATE POLICY "select_own_entries" ON food_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_entries" ON food_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_entries" ON food_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_entries" ON food_entries FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX food_entries_user_id_eaten_at_idx ON food_entries(user_id, eaten_at DESC);

-- Create profiles auto-trigger (if not already exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();