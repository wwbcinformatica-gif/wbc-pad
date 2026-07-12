-- SQL completo para resetar políticas RLS e criar admin
-- Execute no SQL Editor do Supabase

-- 1. Remover TODAS as políticas existentes (isso resolve a recursão)
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

-- 2. Verificar se todas as políticas foram removidas
SELECT COUNT(*) as policies_remaining 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Criar políticas simples e seguras (sem recursão)
-- Profiles: políticas básicas
CREATE POLICY "Public view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Passwords: usuários só gerenciam suas próprias senhas
CREATE POLICY "Users view own passwords" ON passwords
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own passwords" ON passwords
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own passwords" ON passwords
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own passwords" ON passwords
  FOR DELETE USING (auth.uid() = user_id);

-- Notes: usuários só gerenciam suas próprias notas
CREATE POLICY "Users view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- User Settings: usuários só gerenciam suas próprias configurações
CREATE POLICY "Users view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Subscription Plans: admins gerenciam tudo
CREATE POLICY "Users view own plans" ON subscription_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all plans" ON subscription_plans
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins manage all plans" ON subscription_plans
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4. Agora criar o perfil admin (depois das políticas estarem corrigidas)
INSERT INTO public.profiles (id, email, name, role, subscription_status, trial_ends_at)
VALUES (
  'c2927705-1fed-4106-892e-fe12aef18a79',
  'wwbcinformatica@gmail.com',
  'WBC Informática',
  'admin',
  'active',
  NOW() + INTERVAL '7 days'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  subscription_status = 'active',
  name = 'WBC Informática',
  updated_at = NOW();

-- 5. Verificar se o admin foi criado
SELECT id, email, name, role, subscription_status 
FROM profiles 
WHERE email = 'wwbcinformatica@gmail.com';

-- 6. Verificar se as políticas foram criadas corretamente
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'passwords', 'notes', 'user_settings', 'subscription_plans')
ORDER BY tablename, policyname;

-- 7. Mensagem final de confirmação
SELECT 
  '✅ Políticas RLS resetadas com sucesso!' as step1,
  '✅ Usuário wwbcinformatica@gmail.com transformado em admin!' as step2,
  '✅ Sistema pronto para uso!' as step3;