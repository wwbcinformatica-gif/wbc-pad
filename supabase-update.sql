-- WBC NotePad - Supabase Schema Update (para atualizar tabelas existentes)
-- Execute este SQL no Editor do Supabase

-- 1. Adicionar coluna nav_sound se não existir
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS nav_sound BOOLEAN DEFAULT FALSE;

-- 2. Remover políticas RLS existentes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can insert own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can update own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can delete own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view own subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can view all subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can insert subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can update subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can delete subscription plans" ON subscription_plans;

-- 3. Criar novas políticas RLS
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

-- 4. Verificar se a trigger de autenticação existe
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

-- 5. Garantir que as triggers de updated_at existam
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_passwords_updated_at') THEN
    CREATE TRIGGER update_passwords_updated_at
      BEFORE UPDATE ON passwords
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notes_updated_at') THEN
    CREATE TRIGGER update_notes_updated_at
      BEFORE UPDATE ON notes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_settings_updated_at') THEN
    CREATE TRIGGER update_user_settings_updated_at
      BEFORE UPDATE ON user_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscription_plans_updated_at') THEN
    CREATE TRIGGER update_subscription_plans_updated_at
      BEFORE UPDATE ON subscription_plans
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END
$$;

-- 6. Verificar status das tabelas
SELECT 
  'profiles' as table_name,
  COUNT(*) as row_count
FROM profiles
UNION ALL
SELECT 
  'user_settings' as table_name,
  COUNT(*) as row_count
FROM user_settings
UNION ALL
SELECT 
  'subscription_plans' as table_name,
  COUNT(*) as row_count
FROM subscription_plans;

-- Mensagem de confirmação
SELECT 'Atualização do schema concluída com sucesso!' as status;