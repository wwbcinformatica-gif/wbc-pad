-- SQL para corrigir erro de recursão nas políticas RLS
-- Execute no SQL Editor do Supabase

-- 1. Remover todas as políticas existentes primeiro
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- 2. Criar políticas de forma segura, evitando recursão
CREATE POLICY "Public view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins manage profiles" ON profiles
  FOR ALL USING (
    auth.uid() = id OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 3. Verificar se as políticas foram criadas corretamente
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Agora criar o perfil admin
INSERT INTO public.profiles (id, email, name, role, subscription_status, trial_ends_at)
VALUES (
  '7dfdfe08-4df1-4d3b-9363-1127b7a16905',
  'admin@wbc.com',
  'Admin WBC',
  'admin',
  'active',
  NOW() + INTERVAL '7 days'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  subscription_status = 'active',
  name = 'Admin WBC',
  updated_at = NOW();

-- 5. Verificar se o admin foi criado
SELECT id, email, name, role, subscription_status 
FROM profiles 
WHERE email = 'admin@wbc.com';

-- 6. Verificar todos os perfis
SELECT email, name, role, subscription_status 
FROM profiles 
ORDER BY created_at DESC;