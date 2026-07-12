-- WBC NotePad - Supabase Schema
-- Execute this SQL in the Supabase SQL Editor

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'canceled', 'expired')),
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  mp_subscription_id TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add mp_subscription_id column if it doesn't exist (for existing schemas)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;

-- 2. Passwords table
CREATE TABLE IF NOT EXISTS passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('wifi', 'credit-card', 'site-app', 'document', 'bank-account', 'email', 'server-ssh', 'other')),
  title TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Notes table (bloco de notas estilo Inkpad)
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nova Nota',
  content TEXT NOT NULL DEFAULT '',
  tags JSONB DEFAULT '[]',
  type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'checklist', 'agenda', 'caderno')),
  checklist JSONB DEFAULT '[]',
  agenda_date DATE,
  color TEXT DEFAULT '#ffffff',
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure notes table has the required columns and constraints for caderno entries
ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE notes ADD CONSTRAINT IF NOT EXISTS notes_type_check CHECK (type IN ('note', 'checklist', 'agenda', 'caderno'));

-- 4. User Settings table for sound preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  sound_enabled BOOLEAN DEFAULT FALSE,
  sound_volume INT DEFAULT 70 CHECK (sound_volume >= 0 AND sound_volume <= 100),
  sound_type TEXT DEFAULT 'seco' CHECK (sound_type IN ('grave', 'agudo', 'seco', 'violoncelo', 'piano', 'guitarra', 'tambor', 'flauta', 'metal', 'digital')),
  nav_sound BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing nav_sound column if it doesn't exist
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS nav_sound BOOLEAN DEFAULT FALSE;

-- 5. Subscription Plans table for custom plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  duration_days INT NOT NULL CHECK (duration_days > 0),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords(category);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_user_id ON subscription_plans(user_id);

-- 7. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers only if they don't exist
DO $$
BEGIN
  -- Drop existing triggers first
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  DROP TRIGGER IF EXISTS update_passwords_updated_at ON passwords;
  DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
  DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
  DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  -- Create new triggers
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  
  CREATE TRIGGER update_passwords_updated_at
    BEFORE UPDATE ON passwords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  
  CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  
  CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  
  CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
END
$$;

-- 8. Auto-create profile and user settings on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, subscription_status, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'user',
    'trial',
    NOW() + INTERVAL '7 days'
  );
  
  INSERT INTO public.user_settings (user_id, sound_enabled, sound_volume, sound_type, nav_sound)
  VALUES (NEW.id, FALSE, 70, 'seco', FALSE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own, admins can read/update all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR auth.uid() = id);

-- Passwords: users can CRUD their own
CREATE POLICY "Users can view own passwords"
  ON passwords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passwords"
  ON passwords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passwords"
  ON passwords FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own passwords"
  ON passwords FOR DELETE
  USING (auth.uid() = user_id);

-- Notes: users can CRUD their own
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- User Settings: users can CRUD their own
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Subscription Plans: users can view own, admins can view all
CREATE POLICY "Users can view own subscription plans"
  ON subscription_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscription plans"
  ON subscription_plans FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can insert subscription plans"
  ON subscription_plans FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update subscription plans"
  ON subscription_plans FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete subscription plans"
  ON subscription_plans FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create first admin user (run after creating your user in auth)
-- UPDATE profiles SET role = 'admin' WHERE email = 'seu-email@admin.com';
