-- SQL definitivo para corrigir RLS sem recursão
-- Usa função SECURITY DEFINER que bypassa RLS para verificar admin
-- Execute no SQL Editor do Supabase

-- 1. Criar função is_admin() que NÃO causa recursão (SECURITY DEFINER bypassa RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Public view profiles" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins full access to profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can insert own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can update own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can delete own passwords" ON passwords;
DROP POLICY IF EXISTS "Users view own passwords" ON passwords;
DROP POLICY IF EXISTS "Users insert own passwords" ON passwords;
DROP POLICY IF EXISTS "Users update own passwords" ON passwords;
DROP POLICY IF EXISTS "Users delete own passwords" ON passwords;
DROP POLICY IF EXISTS "Admins view all passwords" ON passwords;

DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
DROP POLICY IF EXISTS "Users view own notes" ON notes;
DROP POLICY IF EXISTS "Users insert own notes" ON notes;
DROP POLICY IF EXISTS "Users update own notes" ON notes;
DROP POLICY IF EXISTS "Users delete own notes" ON notes;

DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;
DROP POLICY IF EXISTS "Users view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users delete own settings" ON user_settings;

DROP POLICY IF EXISTS "Users can view own subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can view all subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can insert subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can update subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can delete subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users view own plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins view all plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins manage all plans" ON subscription_plans;

-- 3. Profiles
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins full access to profiles" ON profiles
  FOR ALL USING (public.is_admin());

-- 4. Passwords: dono gerencia, admin vê tudo
CREATE POLICY "Users view own passwords" ON passwords
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own passwords" ON passwords
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own passwords" ON passwords
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own passwords" ON passwords
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins view all passwords" ON passwords
  FOR SELECT USING (public.is_admin());

-- 5. Notes: dono gerencia, admin vê tudo
CREATE POLICY "Users view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- 6. User Settings: dono gerencia
CREATE POLICY "Users view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Subscription Plans: dono vê o próprio, admin gerencia tudo
CREATE POLICY "Users view own plans" ON subscription_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all plans" ON subscription_plans
  FOR ALL USING (public.is_admin());

-- 8. Verificar resultado
SELECT policyname, tablename, cmd, qual
FROM pg_policies
WHERE tablename IN ('profiles','passwords','notes','user_settings','subscription_plans')
ORDER BY tablename, policyname;
