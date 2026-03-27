-- WanderPlan Initial Schema
-- Run this in the Supabase SQL editor

-- ============================================================
-- PROFILES
-- Extends auth.users with app-level profile data
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIPS
-- Central entity for each travel plan
-- ============================================================
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'complete')),

  -- Onboarding fields (M2)
  nationality TEXT,
  travel_styles TEXT[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  group_size INT DEFAULT 2 CHECK (group_size >= 1 AND group_size <= 20),
  budget_amount NUMERIC(10, 2),
  budget_currency TEXT DEFAULT 'USD',

  -- Destination (M3)
  destination_country TEXT,
  destination_flag TEXT,
  visa_type TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trips_user_id_idx ON trips(user_id);
CREATE INDEX IF NOT EXISTS trips_share_token_idx ON trips(share_token);

-- ============================================================
-- DESTINATIONS
-- AI-generated destination candidates (6 per trip)
-- ============================================================
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  visa_type TEXT NOT NULL CHECK (visa_type IN ('visa-free', 'visa-on-arrival', 'e-visa')),
  best_months TEXT[] DEFAULT '{}',
  vibe_tags TEXT[] DEFAULT '{}',
  cost_range_low NUMERIC(10, 2),
  cost_range_high NUMERIC(10, 2),
  cost_currency TEXT DEFAULT 'USD',
  rank INT NOT NULL,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS destinations_trip_id_idx ON destinations(trip_id);

-- ============================================================
-- ITINERARY DAYS
-- One row per day of the trip
-- ============================================================
CREATE TABLE IF NOT EXISTS itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  restaurant_name TEXT,
  restaurant_description TEXT,
  transport_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, day_number)
);

CREATE INDEX IF NOT EXISTS itinerary_days_trip_id_idx ON itinerary_days(trip_id);

-- ============================================================
-- ACTIVITIES
-- 3 per day: morning, afternoon, evening
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('morning', 'afternoon', 'evening')),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT,
  cost_estimate NUMERIC(10, 2),
  cost_currency TEXT DEFAULT 'USD',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activities_day_id_idx ON activities(day_id);

-- ============================================================
-- BUDGET ITEMS
-- 7 categories per trip
-- ============================================================
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'flights', 'accommodation', 'food', 'activities',
    'local_transport', 'shopping', 'miscellaneous'
  )),
  estimated_amount NUMERIC(10, 2) DEFAULT 0,
  actual_amount NUMERIC(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, category)
);

CREATE INDEX IF NOT EXISTS budget_items_trip_id_idx ON budget_items(trip_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trips: full CRUD for owner
DROP POLICY IF EXISTS "Users can CRUD own trips" ON trips;
CREATE POLICY "Users can CRUD own trips" ON trips
  FOR ALL USING (auth.uid() = user_id);

-- Destinations: via trip ownership
DROP POLICY IF EXISTS "Users manage own destinations" ON destinations;
CREATE POLICY "Users manage own destinations" ON destinations
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- Itinerary days: via trip ownership
DROP POLICY IF EXISTS "Users manage own days" ON itinerary_days;
CREATE POLICY "Users manage own days" ON itinerary_days
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- Activities: via day → trip ownership
DROP POLICY IF EXISTS "Users manage own activities" ON activities;
CREATE POLICY "Users manage own activities" ON activities
  FOR ALL USING (
    day_id IN (
      SELECT id FROM itinerary_days
      WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    )
  );

-- Budget items: via trip ownership
DROP POLICY IF EXISTS "Users manage own budget" ON budget_items;
CREATE POLICY "Users manage own budget" ON budget_items
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );
